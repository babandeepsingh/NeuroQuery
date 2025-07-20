'use client';

import { useChat } from './hooks/useChat';
import ChatMessage from './Components/ChatMessage';

export default function HomePage() {
  const {
    message,
    setMessage,
    messages,
    sendMessage,
    loading,
    initializing, // 👈 use this
    replyRef,
    user,
    isSignedIn,
  } = useChat();

  if (initializing) {
    return (
      <main style={styles.container}>
        <h1 style={styles.heading}>Chat with NeuroQuery</h1>
        <p>Loading your chat history...</p>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.heading}>Chat with NeuroQuery</h1>

      <div style={styles.replyWrapper}>
        {messages.length > 0 && (
          <div ref={replyRef} style={styles.replyBox}>
            {messages.map((msg, index) => (
              <ChatMessage key={index} sender={msg.sender} text={msg.text} />
            ))}
          </div>
        )}
      </div>

      <textarea
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask a question or describe a request..."
        style={styles.textarea}
      />
      <button onClick={sendMessage} disabled={loading} style={styles.button}>
        {loading ? 'Thinking...' : 'Send'}
      </button>

      {isSignedIn && <h6>Welcome, {user?.fullName}</h6>}
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
};
