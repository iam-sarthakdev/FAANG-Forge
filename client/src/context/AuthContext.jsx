import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check for stored user on mount
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            setUser(response.data.user);
            setIsAuthenticated(true);
            toast.success('Registration successful! Welcome aboard! 🎉');
            return response;
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            throw error;
        }
    };

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            setUser(response.data.user);
            setIsAuthenticated(true);
            toast.success(`Welcome back, ${response.data.user.name}! 👋`);
            return response;
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            throw error;
        }
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully');
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        register,
        login,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
