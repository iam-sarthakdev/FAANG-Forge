import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, BarChart3, Settings, LogOut, Building2, Network } from 'lucide-react';

const Navigation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/problems', label: 'Problems', icon: BookOpen },
        { path: '/system-design', label: 'System Design', icon: Network },
        { path: '/companies', label: 'Companies', icon: Building2 },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/leetcode-settings', label: 'LeetCode', icon: Settings }
    ];

    return (
        <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/dashboard" className="text-2xl font-bold text-gradient">
                        DSA Tracker
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-8">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="relative"
                                >
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive
                                            ? 'text-white bg-white/10'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        <span className="font-medium">{item.label}</span>
                                    </motion.div>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-sm font-semibold">{user?.name}</div>
                            <div className="text-xs text-white/40">{user?.email}</div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                            <LogOut size={18} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
