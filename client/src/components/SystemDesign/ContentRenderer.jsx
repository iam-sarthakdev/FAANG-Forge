import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ContentRenderer = ({ content, onLinkClick }) => {
    // Custom components for ReactMarkdown
    const components = {
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            );
        },
        img({ node, ...props }) {
            // Fix image paths
            // If path starts with http/https, leave it
            // If path refers to 'images/', prepend '/system-design-data/'
            let src = props.src;
            if (src && !src.startsWith('http')) {
                // Remove leading ./ if present
                if (src.startsWith('./')) {
                    src = src.slice(2);
                }

                // If it points to solutions folder images (often relative ../../images)
                if (src.includes('/images/')) {
                    // Extract just the filename from the path if it's deeply nested to simplify
                    // Assumption: All images were copied to public/system-design-data/images
                    const filename = src.split('/').pop();
                    src = `/system-design-data/images/${filename}`;
                } else if (src.startsWith('images/')) {
                    src = `/system-design-data/${src}`;
                } else {
                    // Fallback for other relative paths, assuming they are relative to the root of system-design-data
                    // This might need adjustment based on specific file structures
                    src = `/system-design-data/${src}`;
                }
            }

            return (
                <img
                    {...props}
                    src={src}
                    className="max-w-full h-auto rounded-lg shadow-lg my-4"
                    loading="lazy"
                />
            );
        },
        a({ node, ...props }) {
            const href = props.href;

            // Handle internal links
            // If it links to a hash anchor #something
            if (href && href.startsWith('#')) {
                return (
                    <a
                        {...props}
                        className="text-primary hover:underline cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                            const id = href.substring(1);
                            const element = document.getElementById(id);
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    >
                        {props.children}
                    </a>
                );
            }

            // If it links to another markdown file in the repo
            if (href && (href.endsWith('.md') || href.includes('#'))) {
                // If it's an external link, let it be
                if (href.startsWith('http')) {
                    return <a {...props} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{props.children}</a>;
                }

                return (
                    <a
                        {...props}
                        className="text-primary hover:underline cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                            onLinkClick(href);
                        }}
                    >
                        {props.children}
                    </a>
                );
            }

            return <a {...props} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{props.children}</a>;
        },
        table({ node, ...props }) {
            return (
                <div className="overflow-x-auto my-4">
                    <table {...props} className="min-w-full border border-white/10 text-left text-sm" />
                </div>
            );
        },
        thead({ node, ...props }) {
            return <thead {...props} className="bg-white/5" />;
        },
        th({ node, ...props }) {
            return <th {...props} className="border-b border-white/10 px-4 py-2 font-semibold text-white" />;
        },
        td({ node, ...props }) {
            return <td {...props} className="border-b border-white/10 px-4 py-2 text-gray-300" />;
        },
        h1({ node, ...props }) {
            return <h1 {...props} className="text-3xl font-bold mt-8 mb-4 text-white border-b border-white/10 pb-2" />;
        },
        h2({ node, ...props }) {
            return <h2 {...props} className="text-2xl font-bold mt-8 mb-4 text-white" />;
        },
        h3({ node, ...props }) {
            return <h3 {...props} className="text-xl font-bold mt-6 mb-3 text-white" />;
        },
        p({ node, ...props }) {
            return <p {...props} className="mb-4 text-gray-300 leading-relaxed" />;
        },
        ul({ node, ...props }) {
            return <ul {...props} className="list-disc list-inside mb-4 text-gray-300 space-y-1" />;
        },
        ol({ node, ...props }) {
            return <ol {...props} className="list-decimal list-inside mb-4 text-gray-300 space-y-1" />;
        },
        blockquote({ node, ...props }) {
            return <blockquote {...props} className="border-l-4 border-primary pl-4 italic text-gray-400 my-4 bg-white/5 py-2 pr-2 rounded-r" />;
        }
    };

    return (
        <div className="prose prose-invert max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeHighlight]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default ContentRenderer;
