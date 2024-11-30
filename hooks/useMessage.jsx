import { useState, useEffect, useCallback } from "react";
import axios from "@/utils/axios";

const useMessage = (roomId) => {
    const limit = 100;
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    const fetchMessages = useCallback(async () => {
        if (!roomId) return;
        setLoading(true);
        try {
            const response = await axios.get(`/messages/rooms/${roomId}`, {
                params: {
                    page: 1,
                    limit,
                },
            });
            setMessages([...response.data.data])
            setHasMore(response.data.data.length === limit);
            setPage((prev) => prev + 1);
        } catch (error) {
            setError(error.message || "Error fetching messages");
        } finally {
            setLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        if (!roomId) return;
            
        fetchMessages();
    }, [fetchMessages, roomId]);

    const addNewMessage = (message) => {
        setMessages((prev) => [message, ...prev]);
    };

    const loadMoreMessage = () => {
        if (!roomId) return;
        if (loading || !hasMore) return;

        setLoading(true);
        axios
            .get(`/messages/rooms/${roomId}`, {
                params: {
                    page,
                    limit,
                },
            })
            .then((response) => {
                setMessages((prev) => [...prev, ...response.data.data]);
                setHasMore(response.data.data.length === limit);
                setPage((prev) => prev + 1);
            })
            .catch((error) => {
                setError(error.message || "Error fetching messages");
            })
            .finally(() => {
                setLoading(false);
            });
    }



    return { messages, loading, error, hasMore, addNewMessage, fetchMessages, loadMoreMessage };
}

export default useMessage;