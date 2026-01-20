import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL || 'https://algoflow-api.onrender.com';
const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;


const getLists = async () => {
    const response = await axios.get(`${API_URL}/lists`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

const getListByName = async (name) => {
    const response = await axios.get(`${API_URL}/lists/${encodeURIComponent(name)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

const addProblemToList = async (listId, sectionTitle, problemData) => {
    const response = await axios.post(`${API_URL}/lists/${listId}/sections/${sectionTitle}/problems`, problemData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

const toggleProblemCompletion = async (listId, sectionId, problemId) => {
    const response = await axios.patch(`${API_URL}/lists/${listId}/sections/${sectionId}/problems/${problemId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

const createSection = async (listId, title) => {
    const response = await axios.post(`${API_URL}/lists/${listId}/sections`, { title }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

const deleteSection = async (listId, sectionId, password) => {
    const response = await axios.delete(`${API_URL}/lists/${listId}/sections/${sectionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        data: { password }
    });
    return response.data;
};

const deleteProblem = async (listId, sectionId, problemId) => {
    const response = await axios.delete(`${API_URL}/lists/${listId}/sections/${sectionId}/problems/${problemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
};

const listService = {
    getLists,
    getListByName,
    getListByName,
    addProblemToList,
    toggleProblemCompletion,
    createSection,
    deleteSection,
    deleteProblem,
    reorderSection: async (listId, sourceIndex, destinationIndex) => {
        const response = await axios.put(`${API_URL}/lists/${listId}/reorder-section`, { sourceIndex, destinationIndex }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },
    reorderProblem: async (listId, sectionId, sourceIndex, destinationIndex) => {
        const response = await axios.put(`${API_URL}/lists/${listId}/sections/${sectionId}/reorder-problem`, { sourceIndex, destinationIndex }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    }
};

export default listService;
