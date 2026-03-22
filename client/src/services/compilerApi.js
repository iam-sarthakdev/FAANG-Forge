import axios from 'axios';

const PISTON_API_URL = 'https://emacs.piston.rs/api/v2/execute';

export const LANGUAGE_VERSIONS = {
    javascript: "18.15.0",
    python: "3.10.0",
    java: "15.0.2",
    cpp: "10.2.0",
    c: "10.2.0"
};

export const executeCode = async (language, sourceCode, stdin = "") => {
    const version = LANGUAGE_VERSIONS[language] || "*";
    
    try {
        const response = await axios.post(PISTON_API_URL, {
            language,
            version,
            files: [{ content: sourceCode }],
            stdin
        });
        
        return response.data;
    } catch (error) {
        console.error("Code Execution Error:", error);
        throw new Error(error.response?.data?.message || "Failed to execute code");
    }
};
