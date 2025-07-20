'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './Components/CodeBlock';

export default function HomePage() {
  const { isSignedIn, user, isLoaded } = useUser();

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([]);

  const replyRef = useRef<HTMLDivElement>(null);

  // Function to send the user message and receive a response from the bot
  const handleSend = async () => {

    const userId = user?.id || 'guest'; // Fallback if user.id is undefined
    if (!message.trim()) return;

    setLoading(true);
    // Add user message to the state
    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: message }]);

    const res = await fetch('/api/genai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userId: user?.id }), // Send the user message with user ID
    });

    const data = await res.json();
    const botReply = data.message || 'No response';

    // Add bot reply to the state
    setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: botReply }]);
    await saveChatToDb(userId, message, 'user');
    await saveChatToDb(userId, botReply, 'bot');
    setMessage(''); // Clear the input field
    setLoading(false);
  };

  // Save chat to the database
  const saveChatToDb = async (userId: string, message: string, sender: 'user' | 'bot') => {
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message, sender }),
    });
  };


  useEffect(() => {
    if (isSignedIn && user.fullName && user.id) {
      checkUserAndCreateUser(user)
    }
  }, [isSignedIn, user])


  const checkUserAndCreateUser = async (user: any) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: user.fullName, id: user.id, email: user.primaryEmailAddress.emailAddress, user }),
    });
  }


  useEffect(() => {
    if (isSignedIn && user?.id) {
      fetchChatHistory(user.id);
    }
  }, [isSignedIn, user]);

  const fetchChatHistory = async (userId: string) => {
    const res = await fetch(`/api/chat?userId=${userId}`);
    const data = await res.json();
    if (data.chats) {
      const chatHistory = data.chats.map((chat: any) => ({
        sender: chat.sender,
        text: chat.message,
      }));
      setMessages(chatHistory);
    }
  };

  // Auto-scroll the reply box to the latest message
  useEffect(() => {
    if (replyRef.current) {
      replyRef.current.scrollTop = replyRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main style={styles.container}>
      <h1 style={styles.heading}>Chat with NeuroQuery</h1>

      {/* Display the entire conversation history */}
      <div style={styles.replyWrapper}>
        {messages.length > 0 && <div ref={replyRef} style={styles.replyBox}>
          {messages.map((msg, index) => (
            <div key={index} style={msg.sender === 'user' ? styles.userMessage : styles.botMessage}>
              <strong>{msg.sender === 'user' ? 'You' : 'GPT'}:</strong>
              <ReactMarkdown
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeContent = String(children).trim();
                    return match ? (
                      <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <CodeBlock language={match[1]} value={codeContent} />
                      </div>
                    ) : (
                      <code
                        style={{
                          backgroundColor: '#eee',
                          padding: '2px 4px',
                          borderRadius: '4px',
                        }}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          ))}
        </div>}
      </div>

      {/* Message input */}
      <textarea
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask a question or describe a request..."
        style={styles.textarea}
      />
      <button onClick={handleSend} disabled={loading} style={styles.button}>
        {loading ? 'Thinking...' : 'Send'}
      </button>

      {/* Display the welcome message */}
      {isSignedIn && <h6>Welcome, {user.fullName}</h6>}
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '720px',
    margin: '3rem auto',
    padding: '2rem',
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  heading: {
    fontSize: '2rem',
    marginBottom: '1.5rem',
    color: '#333',
    textAlign: 'center',
  },
  textarea: {
    width: '100%',
    padding: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    resize: 'vertical',
    marginBottom: '1rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  replyWrapper: {
    marginTop: '2rem',
  },
  replyBox: {
    marginTop: '0.5rem',
    maxHeight: '300px',
    overflowY: 'auto',
    padding: '1rem',
    backgroundColor: '#fff',
    borderRadius: '6px',
    border: '1px solid #eee',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.5',
  },
  userMessage: {
    backgroundColor: '#e1f5fe',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  botMessage: {
    backgroundColor: '#f1f8e9',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
};
