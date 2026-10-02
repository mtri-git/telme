import { useState, useEffect, useCallback, useRef } from "react";
import axios from "@/utils/axios";

const LIMIT = 30;

// Messages are kept newest-first.
const useMessage = (roomId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    // Ignore responses that arrive after the user has switched to another room
    const activeRoomRef = useRef(roomId);
    activeRoomRef.current = roomId;

    const fetchMessages = useCallback(async () => {
        if (!roomId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/messages/rooms/${roomId}`, {
                params: { limit: LIMIT },
            });
            if (activeRoomRef.current !== roomId) return;
            const data = response.data.data || [];
            setMessages(data);
            setHasMore(data.length === LIMIT);
        } catch (error) {
            if (activeRoomRef.current !== roomId) return;
            setError(error?.response?.data?.message || error.message || "Error fetching messages");
        } finally {
            if (activeRoomRef.current === roomId) setLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        // Clear the previous room's messages so they don't flash while loading
        setMessages([]);
        setHasMore(true);
        if (!roomId) return;

        fetchMessages();
    }, [fetchMessages, roomId]);

    const addNewMessage = useCallback((message) => {
        setMessages((prev) => [message, ...prev]);
    }, []);

    const updateMessage = useCallback((id, patch) => {
        setMessages((prev) =>
            prev.map((message) => (message._id === id ? { ...message, ...patch } : message))
        );
    }, []);

    // Cursor pagination: ask for messages older than the oldest one we already have,
    // so messages arriving in the meantime can't shift pages and cause duplicates
    const loadMoreMessage = useCallback(() => {
        if (!roomId || loading || !hasMore) return;

        const oldest = messages[messages.length - 1];
        if (!oldest?.created_at) return;

        setLoading(true);
        axios
            .get(`/messages/rooms/${roomId}`, {
                params: {
                    limit: LIMIT,
                    before: new Date(oldest.created_at).toISOString(),
                },
            })
            .then((response) => {
                if (activeRoomRef.current !== roomId) return;
                const data = response.data.data || [];
                setMessages((prev) => {
                    const seen = new Set(prev.map((m) => String(m._id)));
                    return [...prev, ...data.filter((m) => !seen.has(String(m._id)))];
                });
                setHasMore(data.length === LIMIT);
            })
            .catch((error) => {
                setError(error?.response?.data?.message || error.message || "Error fetching messages");
            })
            .finally(() => {
                if (activeRoomRef.current === roomId) setLoading(false);
            });
    }, [roomId, loading, hasMore, messages]);

    return { messages, loading, error, hasMore, addNewMessage, updateMessage, fetchMessages, loadMoreMessage };
}

export default useMessage;
