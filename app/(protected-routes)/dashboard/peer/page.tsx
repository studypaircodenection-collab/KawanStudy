"use client";

import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PeerCard } from "@/components/peer/peer-card";
import { PeerSearchFilters } from "@/components/peer/peer-search-filters";
import { PeerEmptyState } from "@/components/peer/peer-empty-state";
import { usePeers } from "@/hooks/use-peers";

import { useRouter } from "next/navigation";

interface PeerFilters {
  searchQuery: string;
}

const PeersPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("discover");
  const [filters, setFilters] = useState<PeerFilters>({
    searchQuery: "",
  });

  const {
    peers,
    connections,
    pendingRequests,
    sentRequests,
    blockedUsers,
    loading,
    error,
    searchPeers,
    loadAllData,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    blockUser,
    unblockUser,
    removeConnection,
    clearError,
  } = usePeers();

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Search peers when filters change
  useEffect(() => {
    if (activeTab === "discover") {
      searchPeers(filters);
    }
  }, [filters, activeTab, searchPeers]);

  const handleConnect = async (peerId: string) => {
    await sendConnectionRequest(peerId, "Hi! I'd like to connect with you.");
  };

  const handleMessage = (peerUsername: string) => {
    router.push(`/dashboard/chat/${peerUsername}`);
  };

  const handleAccept = async (peerId: string) => {
    const peer = pendingRequests.find((p) => p.id === peerId);
    if (peer) {
      await acceptConnectionRequest(peer);
    }
  };

  const handleDecline = async (peerId: string) => {
    const peer = pendingRequests.find((p) => p.id === peerId);
    if (peer) {
      await declineConnectionRequest(peer);
    }
  };

  const handleBlock = async (peerId: string) => {
    if (confirm("Are you sure you want to block this user?")) {
      await blockUser(peerId);
    }
  };

  const handleReport = (peerId: string) => {
    // TODO: Implement report functionality
    console.log("Report user:", peerId);
    alert("Report functionality will be implemented soon.");
  };

  const handleRemoveConnection = async (peerId: string) => {
    if (confirm("Are you sure you want to remove this connection?")) {
      await removeConnection(peerId);
    }
  };

  const handleUnblock = async (peerId: string) => {
    if (confirm("Are you sure you want to unblock this user?")) {
      await unblockUser(peerId);
    }
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
    });
  };

  const goToDiscover = () => {
    setActiveTab("discover");
    clearFilters();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Peers</h1>
          <p className="text-muted-foreground">
            Connect with fellow students and build your study network
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {connections.length} Connection{connections.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <PeerSearchFilters filters={filters} onFiltersChange={setFilters} />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={clearError}
            className="text-red-600 underline text-sm mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="connections">
            Connections ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sent">Sent ({sentRequests.length})</TabsTrigger>
          <TabsTrigger value="blocked">
            Blocked ({blockedUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading peers...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2  gap-4">
                {peers.map((peer) => (
                  <PeerCard
                    key={peer.id}
                    peer={peer}
                    onConnect={handleConnect}
                    onMessage={handleMessage}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onBlock={handleBlock}
                    onReport={handleReport}
                  />
                ))}
              </div>
              {peers.length === 0 && (
                <PeerEmptyState
                  type={filters.searchQuery ? "search" : "discover"}
                  onAction={clearFilters}
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">
                Loading connections...
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2  gap-4">
                {connections.map((peer) => (
                  <PeerCard
                    key={peer.id}
                    peer={peer}
                    onMessage={handleMessage}
                    onBlock={handleBlock}
                    onReport={handleReport}
                    onRemoveConnection={handleRemoveConnection}
                  />
                ))}
              </div>
              {connections.length === 0 && (
                <PeerEmptyState type="connections" onAction={goToDiscover} />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading requests...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2  gap-4">
                {pendingRequests.map((peer) => (
                  <PeerCard
                    key={peer.id}
                    peer={peer}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onBlock={handleBlock}
                    onReport={handleReport}
                  />
                ))}
              </div>
              {pendingRequests.length === 0 && (
                <PeerEmptyState type="requests" />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">
                Loading sent requests...
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2  gap-4">
                {sentRequests.map((peer) => (
                  <PeerCard key={peer.id} peer={peer} onReport={handleReport} />
                ))}
              </div>
              {sentRequests.length === 0 && (
                <PeerEmptyState type="sent" onAction={goToDiscover} />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="blocked" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">
                Loading blocked users...
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                {blockedUsers.map((peer) => (
                  <PeerCard
                    key={peer.id}
                    peer={peer}
                    onUnblock={handleUnblock}
                    onReport={handleReport}
                  />
                ))}
              </div>
              {blockedUsers.length === 0 && (
                <PeerEmptyState type="blocked" onAction={goToDiscover} />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PeersPage;
