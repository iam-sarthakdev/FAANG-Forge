import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

// Create axios instance with auth interceptor
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const contentService = {
    getFundamentals: async (topic) => {
        const response = await api.get(`/content/fundamentals/${topic}`);
        return response.data;
    },

    getBehavioral: async () => {
        const response = await api.get('/content/behavioral');
        return response.data;
    },

    getDSA: async (path = '') => {
        const response = await api.get(`/content/dsa?path=${encodeURIComponent(path)}`);
        return response.data;
    },

    getSystemDesign: async (type = 'hld') => {
        const response = await api.get(`/content/system-design?type=${type}`);
        return response.data;
    },

    getFileContent: async (path) => {
        // Path needs to be encoded properly
        const response = await api.get(`/content/file?path=${encodeURIComponent(path)}`);
        return response.data;
    }
};

export default contentService;
