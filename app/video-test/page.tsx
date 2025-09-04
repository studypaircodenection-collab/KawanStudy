"use client";

import { useState } from "react";
import { WebRTCVideoRoom } from "@/components/video/webrtc-video-room";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function VideoTestPage() {
  const [isInCall, setIsInCall] = useState(false);
  const [roomId, setRoomId] = useState("");

  // Mock current user ID for testing
  const currentUserId = "test-user-id";

  const startCall = () => {
    const testRoomId = `test-room-${Date.now()}`;
    setRoomId(testRoomId);
    setIsInCall(true);
  };

  const endCall = () => {
    setIsInCall(false);
    setRoomId("");
  };

  if (isInCall) {
    return <WebRTCVideoRoom roomId={roomId} onLeave={endCall} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full bg-gray-800 border-gray-700 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Video Call Test</h1>
          <p className="text-gray-300 mb-6">
            Test the refactored video system with dynamic streams support. This
            will create a test room and allow multiple participants to join.
          </p>

          <Button
            onClick={startCall}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Start Video Call Test
          </Button>

          <div className="mt-4 text-sm text-gray-400">
            <p>Features being tested:</p>
            <ul className="mt-2 space-y-1">
              <li>• Real-time participant tracking</li>
              <li>• Dynamic stream management</li>
              <li>• Multi-user video display</li>
              <li>• WebRTC peer connections</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
