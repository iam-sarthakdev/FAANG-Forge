import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ProblemsPage from './pages/ProblemsPage';
import ProblemDetail from './pages/ProblemDetail';
import AnalyticsPage from './pages/AnalyticsPage';
import EnhancedAnalyticsPage from './pages/EnhancedAnalyticsPage';
import CompaniesPage from './pages/CompaniesPage';
import DashboardPage from './pages/DashboardPage';
import SystemDesignPage from './pages/SystemDesignPage';
import LeetCodeSettings from './pages/LeetCodeSettings';
import PageLayout from './components/PageLayout';

import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component  
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={
                <PublicRoute>
                    <LoginPage />
                </PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute>
                    <RegisterPage />
                </PublicRoute>
            } />

            {/* Protected routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <PageLayout>
                        <DashboardPage />
                    </PageLayout>
                </ProtectedRoute>
            } />
            <Route path="/problems" element={
                <ProtectedRoute>
                    <PageLayout>
                        <ProblemsPage />
                    </PageLayout>
                </ProtectedRoute>
            } />
            <Route path="/companies" element={
                <ProtectedRoute>
                    <PageLayout>
                        <CompaniesPage />
                    </PageLayout>
                </ProtectedRoute>
            } />
            <Route path="/system-design" element={
                <ProtectedRoute>
                    <PageLayout fullWidth>
                        <SystemDesignPage />
                    </PageLayout>
                </ProtectedRoute>
            } />
            <Route path="/problems/:id" element={
                <ProtectedRoute>
                    <PageLayout>
                        <ProblemDetail />
                    </PageLayout>
                </ProtectedRoute>
            } />
            <Route path="/analytics" element={
                <ProtectedRoute>
                    <PageLayout>
                        <EnhancedAnalyticsPage />
                    </PageLayout>
                </ProtectedRoute>
            } />
            <Route path="/leetcode-settings" element={
                <ProtectedRoute>
                    <PageLayout>
                        <LeetCodeSettings />
                    </PageLayout>
                </ProtectedRoute>
            } />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#1C1C1E',
                            color: '#fff',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        },
                        success: {
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#fff'
                            }
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff'
                            }
                        }
                    }}
                />
                <div className="min-h-screen">
                    <AppRoutes />
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
