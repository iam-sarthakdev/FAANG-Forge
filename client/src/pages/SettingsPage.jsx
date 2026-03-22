import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, AtSign, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
    const { user, login } = useAuth(); // Assuming login or a similar context function can update context state
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || ''
    });
    
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic username validation
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (formData.username && !usernameRegex.test(formData.username)) {
            return toast.error('Username can only contain letters, numbers, underscores, and hyphens.');
        }

        setLoading(true);
        try {
            const updatedUser = await authAPI.updateProfile({
                name: formData.name,
                username: formData.username
            });
            
            // Assuming we can update local storage directly here if context doesn't expose an update method
            if (updatedUser) {
                const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
                const mergedUser = { ...existingUser, ...updatedUser };
                localStorage.setItem('user', JSON.stringify(mergedUser));
                
                // Tricky: we might need a page reload or context re-fetch if no method exists.
                // But typically reloading or having the user re-login is fine. Let's rely on reload for now for simplicity.
                toast.success('Profile updated successfully');
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            const msg = error.response?.data?.message || 'Failed to update profile';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                    Profile Settings
                </h1>
                <p className="text-white/60 mt-2">Manage your public profile and preferences.</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 md:p-8"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Read Only Email */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Email Address
                        </label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/50 cursor-not-allowed"
                        />
                        <p className="text-xs text-white/40 mt-1">Email cannot be changed.</p>
                    </div>

                    {/* Display Name */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                            <User className="w-4 h-4" /> Display Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Your full name"
                            className="w-full bg-[#1e1e24] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                            <AtSign className="w-4 h-4" /> Public Username
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">algo-flow.com/u/</span>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="username"
                                className="w-full bg-[#1e1e24] border border-white/10 rounded-lg pl-[118px] pr-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>
                        <p className="text-xs text-white/40 mt-1">
                            This is your unique URL for sharing your activity heatmap and stats.
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default SettingsPage;
