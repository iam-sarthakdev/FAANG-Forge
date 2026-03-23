import api from './api';

export const LANGUAGE_VERSIONS = {
    javascript: "Node.js",
    python: "Python 3",
    java: "Java (OpenJDK)",
    cpp: "C++ (GCC)",
    c: "C (GCC)"
};

export const executeCode = async (language, sourceCode, stdin = "") => {
    try {
        const response = await api.post('/compiler/execute', {
            language,
            sourceCode,
            stdin
        });
        return response.data;
    } catch (error) {
        console.error("Code Execution Error:", error);
        throw new Error(error.response?.data?.message || "Failed to execute code");
    }
};
