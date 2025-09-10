"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function CreateSessionPage() {
  const [creating, setCreating] = useState(false);
  const [joinId, setJoinId] = useState("");
  const router = useRouter();

  async function createRoom() {
    setCreating(true);
    const id = makeId();
    const url = `${window.location.origin}/dashboard/meeting?room=${encodeURIComponent(id)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore clipboard errors
    }
    router.push(`/dashboard/meeting?room=${encodeURIComponent(id)}`);
    setCreating(false);
  }

  function joinRoom() {
    if (!joinId) return;
    router.push(`/dashboard/meeting?room=${encodeURIComponent(joinId)}`);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Start a New Session</h1>

      <div className="mb-4">
        <button onClick={createRoom} disabled={creating} className="px-4 py-2 bg-blue-600 text-white rounded">
          {creating ? 'Creating…' : 'Create new room'}
        </button>
      </div>

      <div className="mb-2">Or join an existing room</div>
      <div className="flex gap-2">
        <input value={joinId} onChange={(e) => setJoinId(e.target.value)} placeholder="Room ID" className="flex-1 px-3 py-2 border rounded" />
        <button onClick={joinRoom} className="px-3 py-2 bg-gray-200 rounded">Join</button>
      </div>
    </div>
  );
}
