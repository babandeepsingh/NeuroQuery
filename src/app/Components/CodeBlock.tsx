'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
    language: string;
    value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <button
                onClick={handleCopy}
                style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '0.5rem',
                    backgroundColor: '#eee',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                }}
            >
                Copy SQL
            </button>
            {copied && (
                <span
                    className='flex items-center justify-center'
                    style={{
                        position: 'absolute',
                        top: '0.5rem',
                        left: '0.5rem',
                        width: 'calc(100% - 1rem)',
                        height: '2.5rem',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        color: 'green',
                        backgroundColor: '#e0ffe0',
                        padding: '2px 10px',
                        borderRadius: '4px',
                    }}
                >
                    Copied!
                </span>
            )}
            <SyntaxHighlighter
                language={language}
                style={oneLight}
                PreTag="div"
                wrapLongLines
                wrapLines
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
};

export default CodeBlock;
