import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Link as LinkIcon, RefreshCw, Trash2, CheckCircle, Upload, Loader2, Key, AlertCircle, Github } from 'lucide-react';
import api from '../services/api';

const LeetCodeSettings = () => {
    const [credentials, setCredentials] = useState({
        leetcode_username: '',
        session_cookie: '',
        csrf_token: ''
    });

    const [syncStatus, setSyncStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [message, setMessage] = useState(null);
    const [bulkUrls, setBulkUrls] = useState('');
    const [bulkImporting, setBulkImporting] = useState(false);
    const [bulkImportResult, setBulkImportResult] = useState(null);

    // GitHub sync state
    const [githubSyncing, setGithubSyncing] = useState(false);
    const [githubSyncResult, setGithubSyncResult] = useState(null);

    useEffect(() => {
        fetchSyncStatus();
    }, []);

    const fetchSyncStatus = async () => {
        try {
            const response = await api.get('/leetcode/status');
            setSyncStatus(response.data);
            if (response.data.configured) {
                setCredentials(prev => ({ ...prev, leetcode_username: response.data.username }));
            }
        } catch (error) {
            console.error('Failed to fetch sync status:', error);
        }
    };

    const handleSaveCredentials = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post(
                '/leetcode/credentials',
                credentials
            );

            setMessage({ type: 'success', text: 'Credentials saved successfully!' });
            fetchSyncStatus();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to save credentials' });
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.post(
                '/leetcode/sync',
                {}
            );

            setMessage({
                type: 'success',
                text: `Sync completed! Imported: ${response.data.stats.imported}, Updated: ${response.data.stats.updated}`
            });
            fetchSyncStatus();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Sync failed' });
        } finally {
            setSyncing(false);
        }
    };

    const handleBulkImport = async () => {
        try {
            setBulkImporting(true);
            setBulkImportResult(null);

            // Parse URLs from textarea
            const urls = bulkUrls
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.includes('leetcode.com/problems/'));

            if (urls.length === 0) {
                setBulkImportResult({
                    success: false,
                    message: 'No valid LeetCode URLs found'
                });
                return;
            }

            const response = await api.post(
                '/leetcode/bulk-import',
                { urls }
            );

            setBulkImportResult({
                success: true,
                message: response.data.message,
                stats: response.data.stats
            });

            // Refresh sync status
            await fetchSyncStatus();
        } catch (error) {
            setBulkImportResult({
                success: false,
                message: error.response?.data?.error || 'Bulk import failed'
            });
        } finally {
            setBulkImporting(false);
        }
    };

    const handleGitHubSync = async () => {
        try {
            setGithubSyncing(true);
            setGithubSyncResult(null);

            const response = await api.post(
                '/leetcode/sync-github',
                {
                    githubUsername: 'iam-sarthakdev',
                    githubRepo: 'LeetCode'
                }
            );

            setGithubSyncResult({
                success: true,
                message: response.data.message,
                stats: response.data.stats
            });

            // Refresh sync status
            await fetchSyncStatus();
        } catch (error) {
            setGithubSyncResult({
                success: false,
                message: error.response?.data?.error || 'GitHub sync failed'
            });
        } finally {
            setGithubSyncing(false);
        }
    };

    return (
        <div className="min-h-screen p-6 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-5xl font-bold text-gradient mb-2">LeetCode Integration</h1>
                <p className="text-white/60">Sync your solved problems automatically</p>
            </motion.div>

            {/* Instructions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 mb-6"
            >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Key className="text-primary" />
                    How to Get Your Cookies
                </h3>
                <ol className="space-y-2 text-white/80">
                    <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">1.</span>
                        <span>Open <a href="https://leetcode.com" target="_blank" className="text-primary hover:underline">LeetCode.com</a> while logged in</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">2.</span>
                        <span>Press <kbd className="px-2 py-1 bg-white/10 rounded">F12</kbd> → Go to "Application" tab</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">3.</span>
                        <span>Click "Cookies" → "https://leetcode.com"</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">4.</span>
                        <span>Find and copy:
                            <ul className="ml-4 mt-2 space-y-1">
                                <li>• <code className="bg-white/10 px-2 py-1 rounded">LEETCODE_SESSION</code></li>
                                <li>• <code className="bg-white/10 px-2 py-1 rounded">csrftoken</code></li>
                            </ul>
                        </span>
                    </li>
                </ol>
            </motion.div>

            {/* Credentials Form */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onSubmit={handleSaveCredentials}
                className="glass-card p-6 mb-6"
            >
                <h3 className="text-2xl font-bold mb-6">Credentials</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">LeetCode Username</label>
                        <input
                            type="text"
                            value={credentials.leetcode_username}
                            onChange={(e) => setCredentials({ ...credentials, leetcode_username: e.target.value })}
                            placeholder="Sarthak_1712"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">LEETCODE_SESSION Cookie</label>
                        <textarea
                            value={credentials.session_cookie}
                            onChange={(e) => setCredentials({ ...credentials, session_cookie: e.target.value })}
                            placeholder="Paste your LEETCODE_SESSION cookie value here..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">csrftoken Cookie</label>
                        <input
                            type="text"
                            value={credentials.csrf_token}
                            onChange={(e) => setCredentials({ ...credentials, csrf_token: e.target.value })}
                            placeholder="Paste your csrftoken value here..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
                            required
                        />
                    </div>
                </div>

                {message?.text && (
                    <div className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : 'bg-red-500/20 text-red-400 border border-red-500/50'
                        }`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 bg-primary hover:bg-primary/80 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Key size={20} />}
                    {loading ? 'Saving...' : 'Save Credentials'}
                </button>
            </motion.form>

            {/* Sync Section */}
            {syncStatus?.configured && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-2xl font-bold mb-6">Sync Status</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/5 p-4 rounded-lg">
                            <div className="text-white/60 text-sm mb-1">Last Synced</div>
                            <div className="font-bold">
                                {syncStatus.last_synced
                                    ? new Date(syncStatus.last_synced).toLocaleString()
                                    : 'Never'}
                            </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                            <div className="text-white/60 text-sm mb-1">Problems Synced</div>
                            <div className="text-3xl font-bold text-primary">{syncStatus.total_problems_synced}</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                            <div className="text-white/60 text-sm mb-1">Status</div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${syncStatus.sync_enabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <span>{syncStatus.sync_enabled ? 'Active' : 'Disabled'}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="w-full bg-gradient-to-r from-primary to-secondary px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                    >
                        {syncing ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                        {syncing ? 'Syncing...' : 'Sync from LeetCode Now'}
                    </button>
                </motion.div>
            )}

            {/* GitHub Auto-Sync Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-8 mb-6"
            >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Github size={24} className="text-primary" />
                    GitHub Auto-Sync (Recommended!)
                </h2>
                <p className="text-white/70 mb-4">
                    Automatically import problems from your GitHub repository with your actual code!
                    This bypasses LeetCode's API limitations.
                </p>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-300">
                        <strong>✨ Repository:</strong> iam-sarthakdev/LeetCode
                    </p>
                    <p className="text-sm text-blue-300 mt-1">
                        <strong>📦 Problems Found:</strong> 268 solved problems with code
                    </p>
                </div>

                <button
                    onClick={handleGitHubSync}
                    disabled={githubSyncing}
                    className="btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
                >
                    {githubSyncing ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Syncing from GitHub...
                        </>
                    ) : (
                        <>
                            <Github size={20} />
                            Import from GitHub
                        </>
                    )}
                </button>

                {githubSyncResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`mt-4 p-4 rounded-lg ${githubSyncResult.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}
                    >
                        <p className={`font-semibold ${githubSyncResult.success ? 'text-green-400' : 'text-red-400'}`}>
                            {githubSyncResult.message}
                        </p>
                        {githubSyncResult.stats && (
                            <div className="mt-3 grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{githubSyncResult.stats.imported}</div>
                                    <div className="text-xs text-white/60">Imported</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{githubSyncResult.stats.updated}</div>
                                    <div className="text-xs text-white/60">Updated</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{githubSyncResult.stats.total}</div>
                                    <div className="text-xs text-white/60">Total</div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>

            {/* Bulk Import Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-8 mb-6"
            >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Upload size={24} className="text-primary" />
                    Bulk Import from URLs
                </h2>
                <p className="text-white/60 mb-4">
                    Paste LeetCode problem URLs (one per line) to import all your solved problems at once.
                    Get URLs from: <a href="https://leetcode.com/problemset/all/?status=Solved" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LeetCode Solved Problems</a>
                </p>

                <textarea
                    value={bulkUrls}
                    onChange={(e) => setBulkUrls(e.target.value)}
                    placeholder="https://leetcode.com/problems/two-sum/&#10;https://leetcode.com/problems/add-two-numbers/&#10;https://leetcode.com/problems/longest-substring-without-repeating-characters/&#10;..."
                    className="w-full h-48 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary resize-none font-mono text-sm mb-4"
                />

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBulkImport}
                        disabled={bulkImporting || !bulkUrls.trim()}
                        className="btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {bulkImporting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <Upload size={20} />
                                Import Problems
                            </>
                        )}
                    </button>

                    {bulkUrls.trim() && (
                        <span className="text-sm text-white/60">
                            {bulkUrls.trim().split('\n').filter(line => line.includes('leetcode.com')).length} URLs detected
                        </span>
                    )}
                </div>

                {bulkImportResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`mt-4 p-4 rounded-lg ${bulkImportResult.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}
                    >
                        <p className={`font-semibold ${bulkImportResult.success ? 'text-green-400' : 'text-red-400'}`}>
                            {bulkImportResult.message}
                        </p>
                        {bulkImportResult.stats && (
                            <p className="text-sm text-white/60 mt-2">
                                Imported: {bulkImportResult.stats.imported} | Updated: {bulkImportResult.stats.updated} | Failed: {bulkImportResult.stats.failed || 0}
                            </p>
                        )}
                    </motion.div>
                )}
            </motion.div>

            {/* Security Notice */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-400"
            >
                <strong>🔒 Security Notice:</strong> Your cookies are encrypted and stored securely. They are only used to fetch your problem data and are never shared.
            </motion.div>
        </div>
    );
};

export default LeetCodeSettings;
