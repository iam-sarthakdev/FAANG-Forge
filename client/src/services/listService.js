import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL || 'https://algoflow-api.onrender.com';
const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

// Default timeout for API calls (15 seconds)
const DEFAULT_TIMEOUT = 15000;
// Longer timeout for seed/heavy operations (30 seconds)
const LONG_TIMEOUT = 30000;

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
});

const getLists = async () => {
    const response = await axios.get(`${API_URL}/lists`, {
        headers: getAuthHeaders(),
        timeout: DEFAULT_TIMEOUT
    });
    return response.data;
};

const getListByName = async (name) => {
    const response = await axios.get(`${API_URL}/lists/${encodeURIComponent(name)}`, {
        headers: getAuthHeaders(),
        timeout: DEFAULT_TIMEOUT
    });
    return response.data;
};

const addProblemToList = async (listId, sectionTitle, problemData) => {
    const response = await axios.post(`${API_URL}/lists/${listId}/sections/${encodeURIComponent(sectionTitle)}/problems`, problemData, {
        headers: getAuthHeaders(),
        timeout: DEFAULT_TIMEOUT
    });
    return response.data;
};

const toggleProblemCompletion = async (listId, sectionId, problemId) => {
    const response = await axios.patch(`${API_URL}/lists/${listId}/sections/${sectionId}/problems/${problemId}/toggle`, {}, {
        headers: getAuthHeaders(),
        timeout: DEFAULT_TIMEOUT
    });
    return response.data;
};

const createSection = async (listId, title) => {
    const response = await axios.post(`${API_URL}/lists/${listId}/sections`, { title }, {
        headers: getAuthHeaders(),
        timeout: DEFAULT_TIMEOUT
    });
    return response.data;
};

const deleteSection = async (listId, sectionId, password) => {
    const response = await axios.delete(`${API_URL}/lists/${listId}/sections/${sectionId}`, {
        headers: getAuthHeaders(),
        data: { password },
        timeout: DEFAULT_TIMEOUT
    });
    return response.data;
};

const deleteProblem = async (listId, sectionId, problemId) => {
    const response = await axios.delete(`${API_URL}/lists/${listId}/sections/${sectionId}/problems/${problemId}`, {
        headers: getAuthHeaders(),
        timeout: DEFAULT_TIMEOUT
    });
    return response.data;
};

const listService = {
    getLists,
    getListByName,
    addProblemToList,
    toggleProblemCompletion,
    incrementRevision: async (listId, sectionId, problemId) => {
        const response = await axios.patch(`${API_URL}/lists/${listId}/sections/${sectionId}/problems/${problemId}/revisit`, {}, {
            headers: getAuthHeaders(),
            timeout: DEFAULT_TIMEOUT
        });
        return response.data;
    },
    createSection,
    deleteSection,
    deleteProblem,
    reorderSection: async (listId, sourceIndex, destinationIndex) => {
        const response = await axios.put(`${API_URL}/lists/${listId}/reorder-section`, { sourceIndex, destinationIndex }, {
            headers: getAuthHeaders(),
            timeout: DEFAULT_TIMEOUT
        });
        return response.data;
    },
    reorderProblem: async (listId, sectionId, sourceIndex, destinationIndex) => {
        const response = await axios.put(`${API_URL}/lists/${listId}/sections/${sectionId}/reorder-problem`, { sourceIndex, destinationIndex }, {
            headers: getAuthHeaders(),
            timeout: DEFAULT_TIMEOUT
        });
        return response.data;
    },
    seedFamousLists: async () => {
        const response = await axios.post(`${API_URL}/lists/seed-famous`, {}, {
            headers: getAuthHeaders(),
            timeout: LONG_TIMEOUT
        });
        return response.data;
    },
    updateCompanyTags: async (listId, sectionId, problemId, companyTags) => {
        const response = await axios.patch(`${API_URL}/lists/${listId}/sections/${sectionId}/problems/${problemId}/company-tags`, { companyTags }, {
            headers: getAuthHeaders(),
            timeout: DEFAULT_TIMEOUT
        });
        return response.data;
    },
    saveCode: async (listId, sectionId, problemId, code, language) => {
        const response = await axios.patch(`${API_URL}/lists/${listId}/sections/${sectionId}/problems/${problemId}/code`, { code, language }, {
            headers: getAuthHeaders(),
            timeout: DEFAULT_TIMEOUT
        });
        return response.data;
    }
};

export default listService;
