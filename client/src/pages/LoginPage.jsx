import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(formData);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card p-8 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gradient mb-2">Welcome Back</h1>
                    <p className="text-white/60">Sign in to continue your coding journey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="input-field"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="input-field"
                            placeholder="••••••••"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </motion.button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-white/60">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary hover:text-secondary transition-colors font-semibold">
                            Sign up
                        </Link>
                    </p>
                </div>

                <Link to="/" className="block mt-4 text-center text-white/40 hover:text-white/60 transition-colors text-sm">
                    ← Back to home
                </Link>
            </motion.div>
        </div>
    );
};

export default LoginPage;
