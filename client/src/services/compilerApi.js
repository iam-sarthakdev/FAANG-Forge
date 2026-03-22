import axios from 'axios';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

export const LANGUAGE_VERSIONS = {
    javascript: "*",
    python: "*",
    java: "*",
    cpp: "*",
    c: "*"
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
