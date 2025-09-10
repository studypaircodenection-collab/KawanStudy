"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
// Static import to ensure Next/Turbopack includes the module in the client bundle.
import clientIo from "socket.io-client";

const SIGNAL_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || "http://localhost:5000";

export default function MeetingPage() {
  const search = useSearchParams();
  const router = useRouter();
  const roomId = search?.get?.("room") || null;

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const socketRef = useRef<any | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const remoteStreamsRef = useRef<Record<string, MediaStream>>({});
  const [remoteIds, setRemoteIds] = useState<string[]>([]);

  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [participantsRaw, setParticipantsRaw] = useState<any[]>([]);
  const [participantStates, setParticipantStates] = useState<Record<string, { cameraOn?: boolean; name?: string }>>({});
  const [socketError, setSocketError] = useState<string | null>(null);
  const [probeResult, setProbeResult] = useState<string | null>(null);
  const [activeSignalUrl, setActiveSignalUrl] = useState<string | null>(null);
  const [socketConnecting, setSocketConnecting] = useState<boolean>(false);
  const [connectAttempts, setConnectAttempts] = useState<number>(0);
  const [displayName, setDisplayName] = useState<string>('');
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [localDiag, setLocalDiag] = useState<string>('');
  const [peerDiag, setPeerDiag] = useState<string>('');
  const [speakerLevels, setSpeakerLevels] = useState<Record<string, number>>({});
  const audioAnalyzersRef = useRef<Record<string, { ctx: AudioContext; analyser: AnalyserNode; src: MediaStreamAudioSourceNode }>>({});
  const appliedTracksRef = useRef<Record<string, Set<string>>>({});
  const makingOfferMapRef = useRef<Record<string, boolean>>({});
  const [uiLog, setUiLog] = useState<string[]>([]);

  function log(msg: string) { setUiLog(l => [...l.slice(-60), `${new Date().toLocaleTimeString()} ${msg}`]); }

  async function enumerateVideoDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const vids = devices.filter(d => d.kind === 'videoinput');
      setVideoDevices(vids);
      if (!selectedDeviceId && vids.length) setSelectedDeviceId(vids[0].deviceId);
    } catch (e:any) {
      console.warn('enumerateDevices failed', e);
    }
  }

  function buildVideoConstraints() {
    if (selectedDeviceId) {
      return { deviceId: { exact: selectedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } } as MediaTrackConstraints;
    }
    return { width: { ideal: 1280 }, height: { ideal: 720 } } as MediaTrackConstraints;
  }

  async function startLocalWithDevice(deviceId?: string) {
    if (deviceId) setSelectedDeviceId(deviceId);
    return startLocal();
  }

  function updateLocalDiagnostics(stream: MediaStream | null) {
    if (!stream) { setLocalDiag('no stream'); return; }
    const vTracks = stream.getVideoTracks();
    const aTracks = stream.getAudioTracks();
    const vtInfo = vTracks.map(t => `${t.label || 'video'}:${t.readyState}:${t.enabled}`).join('|') || 'none';
    const atInfo = aTracks.map(t => `${t.label || 'audio'}:${t.readyState}:${t.enabled}`).join('|') || 'none';
    setLocalDiag(`v[${vTracks.length}] ${vtInfo} | a[${aTracks.length}] ${atInfo}`);
  }

  function buildPeerDiagnostics() {
    return Object.entries(peersRef.current).map(([id, pc]) => {
      const senders = pc.getSenders().map(s=>`${s.track?.kind}:${s.track?.readyState}:${s.track?.id?.slice(0,8)}`).join(';');
      const receivers = pc.getReceivers().map(r=>`${r.track?.kind}:${r.track?.readyState}:${r.track?.id?.slice(0,8)}`).join(';');
      return `${id.slice(0,6)} S[${senders}] R[${receivers}]`;
    }).join(' | ');
  }

  function refreshPeerDiag() { setPeerDiag(buildPeerDiagnostics()); }
  function forceReofferAll() { Object.keys(peersRef.current).forEach(id => renegotiatePeer(id)); }

  function setupAudioLevel(stream: MediaStream, id: string) {
    if (!stream.getAudioTracks().length) return;
    try {
      if (audioAnalyzersRef.current[id]) return;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const src = ctx.createMediaStreamSource(stream);
      src.connect(analyser);
      audioAnalyzersRef.current[id] = { ctx, analyser, src };
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!audioAnalyzersRef.current[id]) return;
        analyser.getByteFrequencyData(data);
        let sum = 0; for (let i=0;i<data.length;i++) sum += data[i];
        const level = sum / data.length; // 0-255
        setSpeakerLevels(s => (s[id] && Math.abs(s[id]-level) < 1 ? s : ({ ...s, [id]: level })));
        requestAnimationFrame(tick);
      };
      tick();
    } catch (e) { console.warn('setupAudioLevel failed', e); }
  }

  useEffect(() => {
    // derive / persist a local display name (simple uniqueness for multi-account test)
    if (typeof window !== 'undefined') {
      let dn = window.localStorage.getItem('meetingDisplayName');
      if (!dn) {
        dn = 'User-' + Math.random().toString(36).slice(2, 6);
        window.localStorage.setItem('meetingDisplayName', dn);
      }
      setDisplayName(dn);
    }
  }, []);

  useEffect(() => {
    if (!roomId) return;
    if (typeof window === "undefined") return; // only run in browser

    let mounted = true;
    let socket: any = null;

    (async () => {
      try {
        const url = SIGNAL_URL;
        setActiveSignalUrl(url);
        setSocketConnecting(true);
        setConnectAttempts(a => a + 1);
        // quick probe
        try {
          const res = await fetch(`${url.replace(/\/$/, '')}/status`);
          setProbeResult(`probe ${url} -> ${res.status}`);
        } catch (e) {
          setProbeResult(`probe fail ${url}: ${e}`);
        }

        socket = clientIo(url, {
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 800,
          timeout: 8000,
          forceNew: true
        });
        socketRef.current = socket;

        socket.on("connect", () => {
          if (!mounted) return;
          console.log("connected to signaling", socket.id);
          setSocketConnected(true);
          setSocketConnecting(false);
          socket.emit("join-room", { roomId, userId: socket.id, name: displayName || 'User' });
        });

        socket.on("connect_error", (err: any) => {
          console.warn('socket connect_error', err);
          setSocketError(String(err?.message || err));
          setSocketConnecting(false);
        });
        socket.on("connect_timeout", (err: any) => {
          setSocketError('connect_timeout');
          setSocketConnecting(false);
        });
        socket.on("reconnect_error", (err: any) => {
          setSocketError('reconnect_error: ' + String(err?.message || err));
          setSocketConnecting(false);
        });

        socket.on("participants", (list: any[]) => {
          if (!mounted) return;
          setParticipantsRaw(list || []);
          const ids = (list || []).map((p: any) => p.socketId).filter(Boolean) as string[];
          const stateMap: Record<string, any> = {};
          (list || []).forEach(p => { if (p.socketId) stateMap[p.socketId] = { cameraOn: p.cameraOn, name: p.name }; });
          setParticipantStates(prev => ({ ...prev, ...stateMap }));
          ids.forEach((id) => {
            if (id !== socket.id) createOffer(id);
          });
          setRemoteIds((cur) => Array.from(new Set([...cur, ...ids.filter((id) => id !== socket.id)])));
        });

        socket.on("state-update", (p: any) => {
          if (!p?.socketId) return;
          setParticipantStates(s => ({ ...s, [p.socketId]: { ...s[p.socketId], cameraOn: p.cameraOn, name: p.name } }));
        });

        socket.on("user-joined", ({ id }: any) => {
          if (!mounted) return;
          if (id && id !== socket.id) {
            createOffer(id);
            setRemoteIds((cur) => Array.from(new Set([...cur, id])));
          }
        });

        socket.on("signal", async ({ fromSocketId, data }: any) => {
          if (!mounted) return;
          if (!fromSocketId) return;
          let pc = peersRef.current[fromSocketId];
          if (!pc) pc = await createPeerConnection(fromSocketId, false);

          const polite = socket.id < fromSocketId; // lexical order decides polite side
          try {
            if (data.type === 'offer') {
              const makingOffer = makingOfferMapRef.current[fromSocketId] || Object.values(makingOfferMapRef.current).some(v=>v);
              const offerCollision = makingOffer || pc.signalingState !== 'stable';
              if (!polite && offerCollision) {
                console.warn('[GLARE] Ignoring offer from', fromSocketId);
                return;
              }
              if (offerCollision) {
                console.log('[GLARE] Rolling back local description');
                await Promise.all([
                  pc.setLocalDescription({ type: 'rollback' } as any),
                  pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
                ]);
              } else {
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
              }
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              socketRef.current?.emit('signal', { to: fromSocketId, data: { type: 'answer', sdp: pc.localDescription } });
            } else if (data.type === 'answer') {
              if (pc && data.sdp && pc.signalingState !== 'closed') {
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
              }
            } else if (data.candidate) {
              if (pc && data.candidate) {
                try { await pc.addIceCandidate(data.candidate); } catch (iceErr) { console.warn('addIceCandidate failed', iceErr); }
              }
            }
          } catch (e) {
            console.warn("signal handling error", e);
          }
        });

        socket.on("chat", (m: any) => {
          if (!mounted) return;
          setMessages((s) => [...s, m]);
        });

        socket.on("user-left", ({ id }: any) => {
          if (!mounted) return;
          removePeer(id);
        });
      } catch (e) {
        console.warn("socket.io init failed", e);
        setSocketError(String((e as Error)?.message || e));
        setSocketConnecting(false);
      }
    })();

    // initial simple probe (kept for legacy debug, overridden by per-candidate probes above)
    (async () => {
      try {
        const res = await fetch(`${SIGNAL_URL.replace(/\/$/, '')}/status`, { method: 'GET' });
        setProbeResult(prev => prev ? prev + ` | initial ${res.status}` : `initial ${res.status}`);
      } catch (err) {
        setProbeResult(prev => prev ? prev + ` | initial fail ${err}` : `initial fail ${err}`);
      }
    })();

    return () => {
      mounted = false;
      try {
        socketRef.current?.emit?.("leave-room");
        socketRef.current?.disconnect?.();
      } catch {}
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, displayName]);

  useEffect(() => {
    if (socketConnected) {
      // auto start microphone so both sides can hear even before video starts
      ensureAudioTrack();
    }
  }, [socketConnected]);

  function attachLocalTracksToPeer(pc: RTCPeerConnection, peerId?: string) {
    if (!localStream) return;
    localStream.getTracks().forEach(track => {
      // find sender of same kind
      let sender = pc.getSenders().find(s => s.track && s.track.kind === track.kind);
      if (sender) {
        if (sender.track !== track) {
          try { sender.replaceTrack(track); } catch(e){ console.warn('replaceTrack failed', e); }
        }
      } else {
        try { pc.addTrack(track, localStream); } catch(e){ console.warn('addTrack failed', e); }
      }
    });
  }

  function ensureRemoteMedia() {
    Object.entries(peersRef.current).forEach(([id, pc]) => {
      // if we already have a remote stream with video for this id, skip
      const existing = remoteStreamsRef.current[id];
      const hasVideo = existing && existing.getVideoTracks().some(t=>t.readyState==='live');
      if (hasVideo) return;
      // build from receivers
      const receivers = pc.getReceivers();
      const videoTracks = receivers.filter(r => r.track && r.track.kind==='video').map(r=>r.track!);
      const audioTracks = receivers.filter(r => r.track && r.track.kind==='audio').map(r=>r.track!);
      if (videoTracks.length || audioTracks.length) {
        const ms = existing || new MediaStream();
        videoTracks.forEach(t => { if (!ms.getVideoTracks().includes(t)) ms.addTrack(t); });
        audioTracks.forEach(t => { if (!ms.getAudioTracks().includes(t)) ms.addTrack(t); });
        remoteStreamsRef.current[id] = ms;
        setRemoteIds(cur => Array.from(new Set([...cur, id])));
      }
    });
  }

  useEffect(() => {
    const int = setInterval(()=> ensureRemoteMedia(), 2000);
    return () => clearInterval(int);
  }, []);

  async function ensureAudioTrack() {
    if (localStream && localStream.getAudioTracks().some(t=>t.readyState==='live')) return;
    try {
      const a = await navigator.mediaDevices.getUserMedia({ audio:true });
      if (localStream) {
        a.getAudioTracks().forEach(t=> localStream.addTrack(t));
      } else {
        const s = new MediaStream(a.getAudioTracks());
        setLocalStream(s);
      }
      Object.entries(peersRef.current).forEach(([pid, pc]) => attachLocalTracksToPeer(pc, pid));
    } catch(e){ console.warn('ensureAudioTrack failed', e);}  
  }

  async function startLocal(): Promise<MediaStream | null> {
    try {
      setMediaError(null);
      // If audio-only -> add video track
      if (localStream && !localStream.getVideoTracks().length) {
        const vStream = await navigator.mediaDevices.getUserMedia({ video: buildVideoConstraints() });
        vStream.getVideoTracks().forEach(t => localStream.addTrack(t));
        if (localVideoRef.current) { localVideoRef.current.srcObject = localStream; await localVideoRef.current.play().catch(()=>{}); }
        setCameraOn(true);
        Object.entries(peersRef.current).forEach(([pid, pc]) => {
          localStream.getTracks().forEach(track => {
            let sender = pc.getSenders().find(s=>s.track && s.track.kind===track.kind);
            if (!sender) { try { pc.addTrack(track, localStream); } catch{} }
            else if (sender.track !== track) { try { sender.replaceTrack(track); } catch{} }
          });
        });
        socketRef.current?.emit('state-update', { cameraOn: true });
        if (typeof forceReofferAll === 'function') forceReofferAll();
        return localStream;
      }
      if (localStream && localStream.getVideoTracks().length) return localStream;
      let s: MediaStream | null = null;
      try { s = await navigator.mediaDevices.getUserMedia({ video: buildVideoConstraints(), audio: true }); }
      catch(err:any){
        if (err?.name==='NotReadableError') { s = await navigator.mediaDevices.getUserMedia({ video: buildVideoConstraints() }); try { const a= await navigator.mediaDevices.getUserMedia({audio:true}); a.getAudioTracks().forEach(t=>s!.addTrack(t)); } catch{} }
        else throw err;
      }
      setLocalStream(s);
      if (localVideoRef.current) { localVideoRef.current.srcObject = s; await localVideoRef.current.play().catch(()=>{}); }
      setCameraOn(true);
      Object.entries(peersRef.current).forEach(([pid, pc]) => {
        s!.getTracks().forEach(track => {
          let sender = pc.getSenders().find(s=>s.track && s.track.kind===track.kind);
          if (!sender) { try { pc.addTrack(track, s!); } catch{} }
          else if (sender.track !== track) { try { sender.replaceTrack(track); } catch{} }
        });
      });
      socketRef.current?.emit('state-update', { cameraOn: true });
      if (typeof forceReofferAll === 'function') forceReofferAll();
      return s;
    } catch(e:any){
      console.error('getUserMedia failed', e);
      setMediaError(e?.name? `${e.name}: ${e.message||e}`: String(e));
      return null;
    }
  }

  function stopLocal() { // now only stops video, leaves audio for mic
    if (localStream) {
      localStream.getVideoTracks().forEach(t=> { try { t.stop(); } catch{}; localStream.removeTrack(t); });
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    setCameraOn(false);
    // detach video from peers (replace with null) but keep audio
    Object.values(peersRef.current).forEach(pc => {
      pc.getSenders().forEach(sender => { if (sender.track && sender.track.kind==='video'){ try { sender.replaceTrack(null); } catch{} } });
    });
    socketRef.current?.emit('state-update', { cameraOn: false });
    if (socketRef.current?.id) setParticipantStates(prev=>({...prev,[socketRef.current.id]:{...(prev[socketRef.current.id]||{}),cameraOn:false}}));
    renegotiateAllPeers();
  }

  function toggleMute() {
    if (!localStream) return;
    const newMuted = !muted;
    for (const t of localStream.getAudioTracks()) t.enabled = !newMuted;
    setMuted(newMuted);
  }

  async function toggleCamera() {
    if (!cameraOn) {
      await startLocal();
    } else {
      stopLocal();
    }
  }

  async function toggleScreenShare() {
    if (screenSharing) {
      // stop screen
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      setScreenSharing(false);
      // restore camera video tracks
      if (localStream) {
        Object.values(peersRef.current).forEach((pc) => {
          const camTrack = localStream.getVideoTracks()[0];
          if (camTrack) {
            const sender = pc.getSenders().find((s) => s.track?.kind === "video");
            if (sender) sender.replaceTrack(camTrack as MediaStreamTrack);
          }
        });
      }
      return;
    }

    try {
      // request display media
      // @ts-ignore
      const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
      screenStreamRef.current = screenStream;
      setScreenSharing(true);
      // replace senders' video track with screen track
      const screenTrack = screenStream.getVideoTracks()[0];
      Object.values(peersRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(screenTrack as MediaStreamTrack);
      });

      // stop screen sharing when user stops
      screenTrack.onended = () => {
        toggleScreenShare();
      };
    } catch (e) {
      console.warn("screen share failed", e);
    }
  }

  async function createOffer(remoteSocketId: string) {
    const pc = await createPeerConnection(remoteSocketId, true);
    attachLocalTracksToPeer(pc, remoteSocketId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current?.emit("signal", { to: remoteSocketId, data: { type: "offer", sdp: pc.localDescription } });
  }

  async function createPeerConnection(remoteSocketId: string, isInitiator: boolean) {
    if (peersRef.current[remoteSocketId]) return peersRef.current[remoteSocketId];
    const pc = new RTCPeerConnection({ iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] });

    let makingOffer = false;
    pc.onnegotiationneeded = async () => {
      try {
        if (pc.signalingState !== 'stable') return;
        makingOfferMapRef.current[remoteSocketId] = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit('signal', { to: remoteSocketId, data: { type: 'offer', sdp: pc.localDescription } });
      } catch (e) {
        console.warn('negotiationneeded error', e);
      } finally {
        makingOfferMapRef.current[remoteSocketId] = false;
      }
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate) socketRef.current?.emit("signal", { to: remoteSocketId, data: { candidate: ev.candidate } });
    };

    pc.ontrack = (ev) => {
      console.log('[MEETING] ontrack from', remoteSocketId, ev.track?.kind, ev.streams?.[0]);
      let s = remoteStreamsRef.current[remoteSocketId];
      if (!s) { s = new MediaStream(); remoteStreamsRef.current[remoteSocketId] = s; }
      ev.streams[0].getTracks().forEach((t) => { if (!s!.getTracks().some(existing => existing.id === t.id)) s!.addTrack(t); });
      if (s.getAudioTracks().length) setupAudioLevel(s, remoteSocketId);
      setRemoteIds((cur) => Array.from(new Set([...cur, remoteSocketId])));
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
        removePeer(remoteSocketId);
      }
    };

    peersRef.current[remoteSocketId] = pc;
    attachLocalTracksToPeer(pc, remoteSocketId);
    return pc;
  }

  // Renegotiation helpers
  async function renegotiatePeer(remoteSocketId: string) {
    const pc = peersRef.current[remoteSocketId];
    const myId = socketRef.current?.id;
    if (!pc || !myId) return;
    // Removed lexical ordering early-return to allow the side that changes tracks to initiate
    try {
      if (pc.signalingState !== 'stable') { console.warn('skip renegotiate, not stable', remoteSocketId, pc.signalingState); return; }
      makingOfferMapRef.current[remoteSocketId] = true;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit('signal', { to: remoteSocketId, data: { type: 'offer', sdp: pc.localDescription } });
    } catch (e) {
      console.warn('renegotiatePeer error', e);
    } finally {
      makingOfferMapRef.current[remoteSocketId] = false;
    }
  }
  function renegotiateAllPeers() { Object.keys(peersRef.current).forEach(id => renegotiatePeer(id)); }

  function removePeer(id: string) {
    try {
      const pc = peersRef.current[id];
      if (pc) pc.close();
      delete peersRef.current[id];
      delete remoteStreamsRef.current[id];
      setRemoteIds((cur) => cur.filter((x) => x !== id));
    } catch {}
  }

  function sendChat() {
    if (!chatInput || !roomId) return;
    socketRef.current?.emit("chat", { roomId, text: chatInput, name: displayName || "You" });
    setChatInput("");
  }

  function leave() {
    try {
      socketRef.current?.emit("leave-room");
      socketRef.current?.disconnect();
    } catch {}
    stopLocal();
    Object.keys(peersRef.current).forEach((k) => removePeer(k));
    router.push("/dashboard");
  }

  function ensureLocalPreview() {
    if (!cameraOn || !localStream || !localVideoRef.current) return;
    try {
      if (localVideoRef.current.srcObject !== localStream) {
        localVideoRef.current.srcObject = localStream;
      }
      if ((localVideoRef.current as any).paused) {
        localVideoRef.current.play().catch(e=>console.warn('local preview play blocked', e));
      }
    } catch(e) { console.warn('ensureLocalPreview error', e); }
  }

  useEffect(() => { ensureLocalPreview(); }, [cameraOn, localStream]);
  useEffect(() => { const id = setInterval(()=> ensureLocalPreview(), 3000); return () => clearInterval(id); }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).meetingDebug = {
        peersRef,
        remoteStreamsRef,
        socketRef,
        getPeerDiag: buildPeerDiagnostics,
        participantStates,
        makingOfferMapRef
      };
    }
  }, [participantStates]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Meeting</h1>
      <div className="mb-3 flex items-center justify-between">
        <div>Room: <strong>{roomId || '—'}</strong></div>
        <div className="flex gap-2">
          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/dashboard/meeting?room=${roomId}`); log('Copied room link'); }} className="px-3 py-1 border rounded">Copy link</button>
          <button onClick={() => { log('Leave clicked'); leave(); }} className="px-3 py-1 bg-red-600 text-white rounded">Leave</button>
        </div>
      </div>
      <div className="mb-3 text-sm text-muted-foreground space-y-0.5">
        <div>Socket connected: {socketConnected ? 'yes' : 'no'} {socketConnecting && !socketConnected && '(connecting...)'}</div>
        <div>Active signaling URL: {activeSignalUrl || '-'} </div>
        <div>Attempts: {connectAttempts}</div>
        <div>Raw participants: {JSON.stringify(participantsRaw)}</div>
        <div>Socket error: {socketError || '-'}</div>
        <div>Signaling probe: {probeResult || '-'}</div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-black rounded h-96 relative overflow-hidden flex items-center justify-center">
          {remoteIds.length === 0 && <div className="text-white">Waiting for participants...</div>}
          <div className="absolute inset-0 grid grid-cols-2 gap-2 p-2">
            {remoteIds.map((id) => {
              const state = participantStates[id];
              const camOn = state?.cameraOn;
              const stream = remoteStreamsRef.current[id];
              const hasVideo = !!stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks().some(t=>t.readyState==='live');
              const showVideo = camOn !== false && hasVideo;
              return (
                <div key={id} className={`relative w-full h-full rounded flex items-center justify-center overflow-hidden ${speakerLevels[id] > 40 ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-neutral-800 bg-neutral-800' : 'bg-neutral-800'}`}>
                  {/* Hidden audio element to ensure audio playback even when video hidden */}
                  {stream && (
                    <audio ref={(el)=> { if (el && stream) { if (el.srcObject !== stream) el.srcObject = stream; el.autoplay = true; el.muted = false; el.play().catch(()=>{}); } }} style={{ display:'none' }} />
                  )}
                  {showVideo && (
                    <video ref={(el) => { if (el && stream) { if (el.srcObject !== stream) el.srcObject = stream; try { el.muted = false; el.play().catch(err => { console.warn('remote video play blocked - retry muted', err); el.muted = true; el.play().catch(()=>{}); setTimeout(()=>{ try { el.muted = false; } catch{} }, 800); }); } catch(e){ console.warn('remote video attach error', e);} } }} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  {!showVideo && (
                    <div className="text-white text-xl font-semibold select-none">{(state?.name?.[0] || 'U').toUpperCase()}</div>
                  )}
                  <div className="absolute left-1 bottom-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                    {state?.name || id.slice(0,6)}
                    {speakerLevels[id] > 40 && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                  </div>
                </div>
              );
            })}
          </div>
          <div className={`absolute right-3 bottom-3 w-44 h-32 rounded overflow-hidden flex items-center justify-center ${speakerLevels[socketRef.current?.id||'local']>40?'ring-2 ring-green-400 ring-offset-2 ring-offset-black bg-gray-800':'bg-gray-800'}`}>
            {cameraOn ? (
              localStream && localStream.getVideoTracks().some(t=>t.readyState==='live') ? (
                <>
                  <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  <button onClick={ensureLocalPreview} className="absolute top-1 right-1 bg-black/40 text-white text-[10px] px-1 rounded">↻</button>
                  {speakerLevels[socketRef.current?.id||'local']>40 && <div className="absolute left-1 top-1 text-[10px] bg-green-500/70 text-white px-1 rounded">Speaking</div>}
                </>
              ) : (
                <div className="text-[10px] text-white p-2 text-center">Video starting...</div>
              )
            ) : (
              <div className="text-white text-xs font-semibold px-2 py-1 bg-neutral-700/70 rounded">
                You{displayName ? ` (${displayName})` : ''}
              </div>
            )}
          </div>
        </div>
        <div className="bg-neutral-900 p-3 rounded shadow h-96 overflow-auto text-white">
          <div className="mb-3">
            <div className="flex gap-2 mb-2">
              <button onClick={async () => { log(cameraOn? 'Stop Video clicked':'Start Video clicked'); if (!cameraOn) { await startLocal(); await enumerateVideoDevices(); } else { stopLocal(); } }} className="px-3 py-1 bg-neutral-800 rounded">{cameraOn ? 'Stop Video' : 'Start Video'}</button>
              <button onClick={() => { log(muted? 'Unmute clicked':'Mute clicked'); toggleMute(); }} className="px-3 py-1 bg-neutral-800 rounded">{muted ? 'Unmute' : 'Mute'}</button>
              <button onClick={() => { log(screenSharing? 'Stop Share clicked':'Share screen clicked'); toggleScreenShare(); }} className="px-3 py-1 bg-neutral-800 rounded">{screenSharing ? 'Stop Share' : 'Share screen'}</button>
              <button onClick={async () => { log('Devices clicked'); await enumerateVideoDevices(); }} className="px-3 py-1 bg-neutral-800 rounded">Devices</button>
              {videoDevices.length > 0 && (
                <select value={selectedDeviceId || ''} onChange={(e)=> { log('Device change'); startLocalWithDevice(e.target.value); }} className="bg-neutral-800 text-xs px-2 py-1 rounded">
                  {videoDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || d.deviceId.slice(0,6)}</option>)}
                </select>
              )}
              <button onClick={()=> { log('Update diagnostics'); updateLocalDiagnostics(localStream); }} className="px-3 py-1 bg-neutral-800 rounded">Diag</button>
            </div>
            <div className="text-sm text-muted-foreground">Participants: {remoteIds.length + 1}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              <button onClick={()=> { log('PeersDiag clicked'); refreshPeerDiag(); }} className="px-2 py-0.5 bg-neutral-700 rounded text-[10px]">PeersDiag</button>
              <button onClick={()=> { log('Force Re-offer clicked'); forceReofferAll(); }} className="px-2 py-0.5 bg-neutral-700 rounded text-[10px]">Force Re-offer</button>
              <button onClick={()=> { log('Rebuild Remotes clicked'); ensureRemoteMedia(); }} className="px-2 py-0.5 bg-neutral-700 rounded text-[10px]">Rebuild Remotes</button>
            </div>
            {peerDiag && <div className="mt-1 text-[10px] text-neutral-500 break-all">{peerDiag}</div>}
            {mediaError && (
              <div className="mt-2 text-xs text-red-400 space-y-1">
                <div>Media error: {mediaError}</div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={startLocal} className="px-2 py-0.5 bg-red-600/20 border border-red-500/40 rounded">Retry</button>
                  <button onClick={() => { stopLocal(); setMediaError(null); }} className="px-2 py-0.5 bg-neutral-700 rounded">Reset</button>
                </div>
                <div className="mt-1 opacity-70">Tips: Close other apps (Zoom/Teams), ensure browser has camera permission (Windows Settings &gt; Privacy &amp; security &gt; Camera), and only one tab uses the camera.</div>
              </div>
            )}
            {videoDevices.length > 0 && !mediaError && (
              <div className="mt-2 text-[10px] text-neutral-400">Video devices: {videoDevices.map(d => d.label || d.deviceId).join(', ')}</div>
            )}
            <div className="text-[10px] opacity-60 truncate">Local: {localDiag}</div>
          </div>
          <div className="border-t pt-3">
            <div className="h-60 overflow-auto mb-2">
              {messages.map((m, i) => (
                <div key={i} className="mb-1"><strong>{m.name || m.from || 'User'}:</strong> {m.text}</div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 px-2 py-1 bg-neutral-800 rounded text-white" placeholder="Message" />
              <button onClick={() => { log('Send chat'); sendChat(); }} className="px-3 py-1 bg-blue-600 text-white rounded">Send</button>
            </div>
          </div>
        </div>
      </div>
      {uiLog.length > 0 && (
        <div className="mt-3 border-t border-neutral-800 pt-2 max-h-32 overflow-auto text-[10px] text-neutral-500 space-y-0.5">
          {uiLog.slice().reverse().map((l,i)=>(<div key={i}>{l}</div>))}
        </div>
      )}
    </div>
  );
}
