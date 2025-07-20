import React from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

interface ChatMessageProps {
  sender: 'user' | 'bot';
  text: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, text }) => {
  const isUser = sender === 'user';

  return (
    <div
      style={{
        backgroundColor: isUser ? '#e1f5fe' : '#f1f8e9',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '1rem',
      }}
    >
      <strong>{isUser ? 'You' : 'GPT'}:</strong>
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeContent = String(children).trim();

            return match ? (
              <div style={{ marginTop: '0.5rem' }}>
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
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default ChatMessage;
