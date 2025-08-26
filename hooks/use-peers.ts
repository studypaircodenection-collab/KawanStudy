import { useState, useCallback } from "react";
import { PeerService } from "@/lib/services/peer-service";
import type { PeerUser } from "@/lib/types";
import { toast } from "sonner";

interface PeerFilters {
  searchQuery: string;
}

export const usePeers = () => {
  const [peers, setPeers] = useState<PeerUser[]>([]);
  const [connections, setConnections] = useState<PeerUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PeerUser[]>([]);
  const [sentRequests, setSentRequests] = useState<PeerUser[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<PeerUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search peers with filters
  const searchPeers = useCallback(async (filters: PeerFilters) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = {
        searchQuery: filters.searchQuery,
        discover: true, // Enable discover mode to exclude connected/blocked users
      };

      const results = await PeerService.searchPeers(searchParams);

      // Apply additional client-side filters
      let filteredResults = results;

      setPeers(filteredResults);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to search peers";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load connections
  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      const results = await PeerService.getConnections("accepted");
      setConnections(results);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load connections";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load pending requests
  const loadPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      const results = await PeerService.getPendingRequests();
      setPendingRequests(results);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load pending requests";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load sent requests
  const loadSentRequests = useCallback(async () => {
    try {
      setLoading(true);
      const results = await PeerService.getSentRequests();
      setSentRequests(results);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load sent requests";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Send connection request
  const sendConnectionRequest = useCallback(
    async (targetUserId: string, message?: string) => {
      try {
        setLoading(true);
        const result = await PeerService.sendConnectionRequest(
          targetUserId,
          message
        );

        if (result.success) {
          toast.success(result.message);

          // Remove the user from discover/peers list since discover excludes pending connections
          setPeers((prevPeers) =>
            prevPeers.filter((peer) => peer.id !== targetUserId)
          );

          // Refresh sent requests to show the new request
          await loadSentRequests();
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to send connection request";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [loadSentRequests]
  );

  // Accept connection request
  const acceptConnectionRequest = useCallback(async (peer: PeerUser) => {
    try {
      setLoading(true);
      const connectionId = (peer as any).request_id || peer.id;
      const result = await PeerService.acceptConnectionRequest(connectionId);

      if (result.success) {
        toast.success(result.message);

        // Remove from pending requests
        setPendingRequests((prev) => prev.filter((p) => p.id !== peer.id));

        // Add to connections
        setConnections((prev) => [
          ...prev,
          { ...peer, connection_status: "connected" },
        ]);

        // Update in peers list
        setPeers((prevPeers) =>
          prevPeers.map((p) =>
            p.id === peer.id ? { ...p, connection_status: "connected" } : p
          )
        );
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to accept connection request";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Decline connection request
  const declineConnectionRequest = useCallback(async (peer: PeerUser) => {
    try {
      setLoading(true);
      const connectionId = (peer as any).request_id || peer.id;
      const result = await PeerService.declineConnectionRequest(connectionId);

      if (result.success) {
        toast.success(result.message);

        // Remove from pending requests
        setPendingRequests((prev) => prev.filter((p) => p.id !== peer.id));

        // Update in peers list
        setPeers((prevPeers) =>
          prevPeers.map((p) =>
            p.id === peer.id ? { ...p, connection_status: "not_connected" } : p
          )
        );
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to decline connection request";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Block user
  const blockUser = useCallback(async (targetUserId: string) => {
    try {
      setLoading(true);
      const result = await PeerService.blockUser(targetUserId);

      if (result.success) {
        toast.success(result.message);

        // Remove from all lists
        setPeers((prev) => prev.filter((p) => p.id !== targetUserId));
        setConnections((prev) => prev.filter((p) => p.id !== targetUserId));
        setPendingRequests((prev) => prev.filter((p) => p.id !== targetUserId));
        setSentRequests((prev) => prev.filter((p) => p.id !== targetUserId));
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to block user";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove connection
  const removeConnection = useCallback(async (targetUserId: string) => {
    try {
      setLoading(true);
      const result = await PeerService.removeConnection(targetUserId);

      if (result.success) {
        toast.success(result.message);

        // Remove from connections
        setConnections((prev) => prev.filter((p) => p.id !== targetUserId));

        // Update in peers list
        setPeers((prevPeers) =>
          prevPeers.map((p) =>
            p.id === targetUserId
              ? { ...p, connection_status: "not_connected" }
              : p
          )
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to remove connection";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load blocked users
  const loadBlockedUsers = useCallback(async () => {
    try {
      setLoading(true);
      const results = await PeerService.getBlockedUsers();
      setBlockedUsers(results);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load blocked users";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Unblock user
  const unblockUser = useCallback(
    async (targetUserId: string) => {
      try {
        setLoading(true);
        setError(null);

        const result = await PeerService.unblockUser(targetUserId);

        if (result.success) {
          toast.success(result.message);
          // Refresh blocked users list
          await loadBlockedUsers();
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to unblock user";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [loadBlockedUsers]
  );

  // Load all data initially
  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadConnections(),
      loadPendingRequests(),
      loadSentRequests(),
      loadBlockedUsers(),
    ]);
  }, [
    loadConnections,
    loadPendingRequests,
    loadSentRequests,
    loadBlockedUsers,
  ]);

  return {
    // Data
    peers,
    connections,
    pendingRequests,
    sentRequests,
    blockedUsers,
    loading,
    error,

    // Actions
    searchPeers,
    loadConnections,
    loadPendingRequests,
    loadSentRequests,
    loadBlockedUsers,
    loadAllData,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    blockUser,
    unblockUser,
    removeConnection,

    // Reset functions
    clearError: () => setError(null),
    resetPeers: () => setPeers([]),
  };
};
