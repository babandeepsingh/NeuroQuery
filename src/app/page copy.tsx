'use client';

import { useEffect, useRef, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './Components/CodeBlock';
import { useUser } from '@clerk/nextjs';

export default function HomePage() {
  console.log(process.env.NEXT_PUBLIC_OPENAI_API_KEY);
  const { isSignedIn, user, isLoaded } = useUser();

  console.log("SignIn", isSignedIn, user, isLoaded)
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const replyRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    setLoading(true);
    const res = await fetch('/api/genai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    console.log(res, "res:::")
    const data = await res.json();
    setReply(data.message || 'No response');
    setLoading(false);
  };

  useEffect(() => {
    if (replyRef.current) {
      replyRef.current.scrollTop = replyRef.current.scrollHeight;
    }
  }, [reply]);

  useEffect(() => {
    if (isSignedIn && user.fullName && user.id) {
      checkUserAndCreateUser(user)
    }
  }, [isSignedIn, user])

  const checkUserAndCreateUser = async (user:any) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: user.fullName, id: user.id, email: user.primaryEmailAddress.emailAddress, user }),
    });
  }

  return (
    <main style={styles.container}>
      <h1 style={styles.heading}>Chat with GPT</h1>
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

      {reply && (
        <div style={styles.replyWrapper}>
          <strong>GPT:</strong>
          <div ref={replyRef} style={styles.replyBox}>
            <ReactMarkdown
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeContent = String(children).trim();
                  const [copied, setCopied] = useState(false);
                  const handleCopy = () => {
                    navigator.clipboard.writeText(codeContent);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  };

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
              {reply}
            </ReactMarkdown>
          </div>
        </div>
      )}
      <h6>{isSignedIn && <>Welcome {user.fullName}</>}</h6>
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

