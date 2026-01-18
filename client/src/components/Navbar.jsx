import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ListChecks, BarChart3, Code2 } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/problems', icon: ListChecks, label: 'Problems' },
        { path: '/analytics', icon: BarChart3, label: 'Analytics' }
    ];

    return (
        <nav className="glass-card mx-6 mt-6 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-3 group">
                    <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <Code2 className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold text-gradient">
                        DSA Revision
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center space-x-2">
                    {navItems.map(({ path, icon: Icon, label }) => {
                        const isActive = location.pathname === path;
                        return (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${isActive
                                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                                        : 'hover:bg-white/10'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-semibold">{label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
