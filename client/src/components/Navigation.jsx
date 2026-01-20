import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    BarChart3,
    Settings,
    LogOut,
    Building2,
    Network,
    Cpu,
    Star,
    FileText,
    Code2,
    ChevronDown,
    User,
    Menu,
    X,
    Layers // For Custom Lists
} from 'lucide-react';

const Navigation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/dsa-sheets', label: 'DSA Sheets', icon: FileText },
        { path: '/problems', label: 'Questions', icon: BookOpen },
        { path: '/fundamentals', label: 'Fundamentals', icon: Cpu },
        { path: '/system-design', label: 'System Design', icon: Network },
        { path: '/lists/sarthak', label: "Sarthak's List", icon: Layers },
        { path: '/behavioral', label: 'Behavioral', icon: Star },
        { path: '/companies', label: 'Companies', icon: Building2 },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl">
            <div className="max-w-[1920px] mx-auto px-6 h-16 flex items-center justify-between">

                {/* Logo Section */}
                <Link to="/dashboard" className="flex items-center gap-3 group z-50 relative">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform duration-300">
                        <Code2 className="text-white w-6 h-6" />
                        <div className="absolute inset-0 rounded-xl bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
                            FAANG Forge
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase group-hover:text-violet-400 transition-colors">
                            Master Your Career
                        </span>
                    </div>
                </Link>

                {/* User Profile Section (Desktop) & Mobile Toggle */}
                <div className="flex items-center gap-4 ml-auto lg:ml-0 lg:order-3">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Desktop Profile Dropdown */}
                    <div className="hidden lg:block relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 group"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-[2px]">
                                <div className="w-full h-full rounded-full bg-[#121214] flex items-center justify-center">
                                    <span className="text-sm font-bold text-white">
                                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </span>
                                </div>
                            </div>
                            <div className="hidden md:flex flex-col items-start mr-2">
                                <span className="text-sm font-semibold text-white leading-none">
                                    {user?.name || 'User'}
                                </span>
                                <span className="text-[10px] text-slate-400 leading-none mt-1 group-hover:text-violet-300 transition-colors">
                                    {user?.email || 'Start Learning'}
                                </span>
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full right-0 mt-3 w-64 p-2 rounded-2xl bg-[#121214]/90 backdrop-blur-2xl border border-white/10 shadow-2xl origin-top-right z-50 flex flex-col gap-1"
                                >
                                    <div className="p-3 mb-2 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Signed in as</p>
                                        <p className="text-sm text-white font-medium truncate">{user?.email}</p>
                                    </div>

                                    <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left">
                                        <User size={16} />
                                        Profile Settings
                                    </button>
                                    <Link
                                        to="/leetcode-settings"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left"
                                    >
                                        <Settings size={16} />
                                        Connect LeetCode
                                    </Link>

                                    <div className="h-px bg-white/5 my-1" />

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left font-medium"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* Overlay to close dropdown */}
                        {isProfileOpen && (
                            <div
                                className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
                                onClick={() => setIsProfileOpen(false)}
                                style={{ margin: '-100vh -100vw', padding: '200vh 200vw' }}
                            />
                        )}
                    </div>
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden lg:flex items-center gap-1 mx-6 lg:order-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative group"
                            >
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300
                                    ${isActive
                                        ? 'text-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Icon size={16} className={isActive ? 'text-violet-400' : 'group-hover:text-violet-400 transition-colors'} />
                                    <span>{item.label}</span>
                                </div>
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_-2px_10px_rgba(139,92,246,0.5)]"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden absolute top-16 left-0 right-0 bg-[#0a0a0b] border-b border-white/10 overflow-hidden shadow-2xl z-40"
                        >
                            <div className="flex flex-col p-4 space-y-2">
                                {/* Mobile User Info */}
                                <div className="flex items-center gap-3 p-3 mb-2 rounded-xl bg-white/5 border border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-[2px]">
                                        <div className="w-full h-full rounded-full bg-[#121214] flex items-center justify-center">
                                            <span className="text-sm font-bold text-white">
                                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-white">{user?.name || 'User'}</span>
                                        <span className="text-xs text-slate-400">{user?.email}</span>
                                    </div>
                                </div>

                                {/* Nav Items */}
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                                ${isActive
                                                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <Icon size={18} />
                                            {item.label}
                                        </Link>
                                    );
                                })}

                                <div className="h-px bg-white/5 my-2" />

                                <Link
                                    to="/leetcode-settings"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    <Settings size={18} />
                                    Connect LeetCode
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all text-left"
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default Navigation;
