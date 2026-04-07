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
import FundamentalsPage from './pages/FundamentalsPage';
import BehavioralPage from './pages/BehavioralPage';
import LeetCodeSettings from './pages/LeetCodeSettings';
import CuratedListsPage from './pages/CuratedListPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfileCardPage from './pages/ProfileCardPage';
import PublicProfilePage from './pages/PublicProfilePage';
import SettingsPage from './pages/SettingsPage';
import SQLMasterPage from './pages/SQLMasterPage';
import SystemDesignRoadmapPage from './pages/SystemDesignRoadmapPage';
import DBMSSheetPage from './pages/DBMSSheetPage';
import OSSheetPage from './pages/OSSheetPage';
import CNSheetPage from './pages/CNSheetPage';
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
            <Route path="/u/:username" element={
                <PageLayout fullWidth>
                    <PublicProfilePage />
                </PageLayout>
            } />

            {/* Protected routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <PageLayout>
                        <DashboardPage />
                    </PageLayout>
                </ProtectedRoute>
            } />
            <Route path="/settings" element={
                <ProtectedRoute>
                    <PageLayout>
                        <SettingsPage />
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
            <Route path="/fundamentals" element={
                <ProtectedRoute>
                    <PageLayout>
                        <FundamentalsPage />
                    </PageLayout>
                </ProtectedRoute>
            } />
            <Route path="/analytics" element={
                <ProtectedRoute>
                    <PageLayout>
                        <AnalyticsPage />
                    </PageLayout>
                </ProtectedRoute>
            } />
// Imports
            // Imports removed from here

            // ... 

            <Route path="/dsa-sheets" element={
                <ProtectedRoute>
                    <PageLayout>
                        <CuratedListsPage />
                    </PageLayout>
                </ProtectedRoute>
            } />
            <Route path="/behavioral" element={
                <ProtectedRoute>
                    <PageLayout>
                        <BehavioralPage />
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
            <Route path="/lists/sarthak" element={
                <ProtectedRoute>
                    <PageLayout>
                        <CuratedListsPage />
                    </PageLayout>
                </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
                <ProtectedRoute>
                    <PageLayout>
                        <LeaderboardPage />
                    </PageLayout>
                </ProtectedRoute>
            } />
            <Route path="/profile-card" element={
                <ProtectedRoute>
                    <PageLayout>
                        <ProfileCardPage />
                    </PageLayout>
                </ProtectedRoute>
            } />

            {/* New Interview Prep Sections */}
            <Route path="/sql-master" element={
                <ProtectedRoute>
                    <PageLayout>
                        <SQLMasterPage />
                    </PageLayout>
                </ProtectedRoute>
            } />
            <Route path="/sd-roadmap" element={
                <ProtectedRoute>
                    <PageLayout fullWidth>
                        <SystemDesignRoadmapPage />
                    </PageLayout>
                </ProtectedRoute>
            } />
            <Route path="/dbms-sheet" element={
                <ProtectedRoute>
                    <PageLayout fullWidth>
                        <DBMSSheetPage />
                    </PageLayout>
                </ProtectedRoute>
            } />
            <Route path="/os-sheet" element={
                <ProtectedRoute>
                    <PageLayout fullWidth>
                        <OSSheetPage />
                    </PageLayout>
                </ProtectedRoute>
            } />
            <Route path="/cn-sheet" element={
                <ProtectedRoute>
                    <PageLayout fullWidth>
                        <CNSheetPage />
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
