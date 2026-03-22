import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ language, value, onChange, theme = 'vs-dark', height = '100%' }) => {
    const editorRef = useRef(null);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        
        // Define a custom theme that matches FAANG-Forge aesthetics
        monaco.editor.defineTheme('faangForgeTheme', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { background: '1E1E1E' }
            ],
            colors: {
                'editor.background': '#151517',
                'editor.lineHighlightBackground': '#1e1e24',
                'editorLineNumber.foreground': '#555555',
                'editorIndentGuide.background': '#333333',
                'scrollbarSlider.background': '#404040',
                'scrollbarSlider.hoverBackground': '#555555',
            }
        });

        monaco.editor.setTheme('faangForgeTheme');
    };

    return (
        <Editor
            height={height}
            language={language === 'c++' ? 'cpp' : language}
            value={value}
            theme="faangForgeTheme"
            onChange={onChange}
            onMount={handleEditorDidMount}
            options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
                wordWrap: 'on',
                lineNumbersMinChars: 3,
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                formatOnPaste: true,
                padding: { top: 16 }
            }}
            loading={
                <div className="flex h-full w-full items-center justify-center text-white/50 bg-[#151517]">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mr-3"></div>
                    Loading Editor...
                </div>
            }
        />
    );
};

export default CodeEditor;
