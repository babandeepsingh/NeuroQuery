import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { fetchChatHistory, saveChatMessage, createUserIfNotExists } from '../utils/chatApi';

export const useChat = () => {
  const { isSignedIn, user } = useUser();
  const replyRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true); // NEW
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([]);

  const userId = user?.id || 'guest';

  const sendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);

    setMessages((prev) => [...prev, { sender: 'user', text: message }]);

    const res = await fetch('/api/genai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userId }),
    });

    const data = await res.json();
    const botReply = data.message || 'No response';

    setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);

    await saveChatMessage(userId, message, 'user');
    await saveChatMessage(userId, botReply, 'bot');

    setMessage('');
    setLoading(false);
  };

  const initializeUser = async () => {
    if (isSignedIn && user?.fullName && user?.primaryEmailAddress?.emailAddress) {
      await createUserIfNotExists(user.id, user.fullName, user.primaryEmailAddress.emailAddress, user);
    }
  };

  const loadChat = async () => {
    if (isSignedIn && user?.id) {
      const history = await fetchChatHistory(user.id);
      setMessages(history);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setInitializing(true); // start
      await initializeUser();
      await loadChat();
      setInitializing(false); // done
    };

    if (isSignedIn && user) {
      initialize();
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    if (replyRef.current) {
      replyRef.current.scrollTop = replyRef.current.scrollHeight;
    }
  }, [messages]);

  return {
    message,
    setMessage,
    messages,
    sendMessage,
    loading,
    initializing, // 👈 expose this
    replyRef,
    user,
    isSignedIn,
  };
};
