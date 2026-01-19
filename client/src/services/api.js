import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data.data.user;
    },

    updateProfile: async (updates) => {
        const response = await api.patch('/auth/profile', updates);
        return response.data.data.user;
    },

    changePassword: async (passwords) => {
        const response = await api.patch('/auth/password', passwords);
        return response.data;
    }
};

// Problems API
export const fetchProblems = async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });
    const response = await api.get(`/problems?${params}`);
    return response.data;
};

export const createProblem = async (problemData) => {
    const response = await api.post('/problems', problemData);
    return response.data;
};

export const getProblemById = async (id) => {
    const response = await api.get(`/problems/${id}`);
    return response.data;
};

// Alias for consistency
export const fetchProblemById = getProblemById;

export const updateProblem = async (id, updates) => {
    const response = await api.patch(`/problems/${id}`, updates);
    return response.data;
};

export const deleteProblem = async (id) => {
    await api.delete(`/problems/${id}`);
};

export const markAsRevised = async (id, data) => {
    const response = await api.post(`/problems/${id}/revisions`, data);
    return response.data;
};

// Dashboard API
export const fetchReminders = async () => {
    const response = await api.get('/dashboard/reminders');
    return response.data;
};

// Pattern API
export const fetchPatterns = async () => {
    const response = await api.get('/patterns');
    return response.data;
};

// Analytics API
export const fetchAnalytics = async () => {
    const response = await api.get('/analytics');
    return response.data;
};

// System Design API
export const systemDesignAPI = {
    getProgress: async () => {
        const response = await api.get('/system-design/progress');
        return response.data;
    },

    toggleTopic: async (topicId) => {
        const response = await api.post('/system-design/progress', { topicId });
        return response.data;
    }
};

export default api;
