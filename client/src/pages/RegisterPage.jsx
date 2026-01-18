import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            navigate('/dashboard');
        } catch (error) {
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 right-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card p-8 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gradient mb-2">Join Us</h1>
                    <p className="text-white/60">Start your DSA mastery journey today</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-red-300 text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="input-field"
                            placeholder="John Doe"
                        />
                    </div>

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

                    <div>
                        <label className="block text-sm font-semibold mb-2">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
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
                        {loading ? 'Creating account...' : 'Create Account'}
                    </motion.button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-white/60">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:text-secondary transition-colors font-semibold">
                            Sign in
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

export default RegisterPage;
