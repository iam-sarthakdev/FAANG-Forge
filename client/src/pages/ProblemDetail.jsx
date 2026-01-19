import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Trash2, Copy, Check, Calendar, Code, FileText, Clock, Box, ExternalLink, RefreshCw, Tag, Edit2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { fetchProblemById, updateProblem, deleteProblem, createProblem, markAsRevised, fetchPatterns } from '../services/api';
import { autoPopulateNotes } from '../services/leetcodeApi';
import theme from '../styles/theme';
import { TOPICS, DIFFICULTIES } from '../utils/constants';
import CustomSelect from '../components/CustomSelect';

const ProblemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // UI States
    const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'code'
    const [isEditingCode, setIsEditingCode] = useState(false);
    const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', 'error'
    const [showConfetti, setShowConfetti] = useState(false);
    const [isLoadingLeetCode, setIsLoadingLeetCode] = useState(false);
    const [leetCodeError, setLeetCodeError] = useState('');
    const [showLeetCodeButton, setShowLeetCodeButton] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        topic: '',
        difficulty: '',
        notes: '',
        codeSnippet: '',
        url: '',
        timeComplexity: '',
        spaceComplexity: '',
        next_reminder_date: '',
        isSolved: false,
        patterns: [],
        companies: [],
        tags: [],
        hints: []
    });

    const [relatedProblems, setRelatedProblems] = useState([]);

    const [availablePatterns, setAvailablePatterns] = useState([]);
    const [problemMetadata, setProblemMetadata] = useState(null); // Stores revision count, etc.

    useEffect(() => {
        if (id && id !== 'new') {
            loadProblem();
        } else {
            // Check for imported problem data
            if (location.state && location.state.importedProblem) {
                const imported = location.state.importedProblem;
                setFormData(prev => ({
                    ...prev,
                    title: imported.title || '',
                    topic: imported.topic || '',
                    difficulty: imported.difficulty || '',
                    url: imported.url || '',
                    companies: imported.companies || []
                }));
            }

            // Load patterns for new problem
            fetchPatterns().then(data => {
                setAvailablePatterns(data.patterns || []);
                setLoading(false);
            }).catch(err => {
                console.error('Failed to load patterns:', err);
                setLoading(false);
            });
        }
    }, [id, location.state]);

    // Auto-save logic
    useEffect(() => {
        if (id !== 'new' && !submitting && !loading && formData.title) {
            const timeoutId = setTimeout(() => {
                handleSave();
            }, 2000);
            return () => clearTimeout(timeoutId);
        }
    }, [formData]);

    const loadProblem = async () => {
        try {
            setLoading(true);
            const [patternsData, data] = await Promise.all([
                fetchPatterns(),
                fetchProblemById(id)
            ]);

            setAvailablePatterns(patternsData.patterns || []);

            setFormData({
                title: data.title || '',
                topic: data.topic || '',
                difficulty: data.difficulty || '',
                notes: data.notes || '',
                codeSnippet: data.codeSnippet || '',
                url: data.url || '',
                timeComplexity: data.timeComplexity || '',
                spaceComplexity: data.spaceComplexity || '',
                next_reminder_date: data.next_reminder_date ? data.next_reminder_date.split('T')[0] : '',
                isSolved: data.isSolved || false,
                patterns: data.patterns || [],
                companies: data.companies || [],
                tags: data.tags || [],
                hints: data.hints || []
            });
            setProblemMetadata(data);
            // Ensure relatedProblems is always an array to prevent crashes
            setRelatedProblems(data.relatedProblems || []);
        } catch (err) {
            console.error('Failed to load problem:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title) return;
        try {
            setSaveStatus('saving');
            await updateProblem(id, formData);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (err) {
            console.error('Save failed:', err);
            setSaveStatus('error');
        }
    };

    const handleSaveNew = async () => {
        if (!formData.title || !formData.topic || !formData.difficulty) {
            alert('Please fill in Title, Topic, and Difficulty');
            return;
        }

        try {
            setSubmitting(true);
            const newProblem = await createProblem(formData);
            navigate(`/problems/${newProblem.id}`);
        } catch (err) {
            alert('Failed to create: ' + err.message);
            setSubmitting(false);
        }
    };

    const handleMarkRevised = async () => {
        try {
            // CRITICAL FIX: Save all current changes first to prevent data loss
            if (formData.title) {
                setSaveStatus('saving');
                await updateProblem(id, formData);
            }

            // Now mark as revised
            await markAsRevised(id, { notes: 'Quick revision' });

            setProblemMetadata(prev => ({
                ...prev,
                revision_count: (prev?.revision_count || 0) + 1,
                last_revised_at: new Date()
            }));

            // Show success status
            setSaveStatus('revised');
            setTimeout(() => setSaveStatus(''), 2500);

            // Reload to get updated data from server
            await loadProblem();
        } catch (err) {
            console.error('Revision failed:', err);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(''), 2000);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Delete this problem permanently?')) {
            await deleteProblem(id);
            navigate('/problems');
        }
    };

    const handleAutoPopulateFromLeetCode = async () => {
        try {
            setIsLoadingLeetCode(true);
            setLeetCodeError('');

            let formattedNotes;

            // Robust Fetch Logic:
            // 1. Try URL if it looks valid
            // 2. If URL fails (or isn't there), try Title

            if (formData.url && formData.url.includes('leetcode.com')) {
                try {
                    formattedNotes = await autoPopulateNotes(formData.url);
                } catch (err) {
                    console.warn('Fetch with URL failed, trying Title as fallback...', err);

                    if (formData.title) {
                        // If URL failed (maybe truncated), try the Title
                        try {
                            formattedNotes = await autoPopulateNotes(formData.title);
                        } catch (titleErr) {
                            // If title also fails, throw the original error (usually more descriptive) or a combined one
                            throw new Error(`Failed to fetch. verified URL is invalid and Title search failed.`);
                        }
                    } else {
                        throw err;
                    }
                }
            } else if (formData.title) {
                // No URL, just use title
                formattedNotes = await autoPopulateNotes(formData.title);
            } else {
                throw new Error('Please add a problem title or LeetCode URL first');
            }

            // Append to existing notes if they exist, or replace
            const newNotes = formData.notes
                ? formData.notes + '\n\n---\n\n' + formattedNotes
                : formattedNotes;

            const updatedFormData = {
                ...formData,
                notes: newNotes
            };

            setFormData(updatedFormData);

            setShowLeetCodeButton(false);

            // AUTO-SAVE LOGIC
            // If it's a new problem and we have the basics, try to create it immediately
            if (id === 'new') {
                if (updatedFormData.title && updatedFormData.topic && updatedFormData.difficulty) {
                    setSubmitting(true);
                    setSaveStatus('saving');
                    try {
                        const newProblem = await createProblem(updatedFormData);
                        setSaveStatus('saved');
                        // Navigate to the created problem to "permanently" lock it in
                        navigate(`/problems/${newProblem.id}`, { replace: true });
                    } catch (createErr) {
                        console.error('Auto-create failed:', createErr);
                        setSaveStatus('error');
                        setLeetCodeError('fetched data but failed to auto-save to DB. Please click "Create Problem".');
                    } finally {
                        setSubmitting(false);
                    }
                } else {
                    setLeetCodeError('Fetched! Please fill Topic/Difficulty and click Create.');
                }
            } else {
                // For existing problem, force an update immediately
                setSaveStatus('saving');
                await updateProblem(id, updatedFormData);
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus(''), 2000);
            }

        } catch (error) {
            console.error('Failed to fetch from LeetCode:', error);
            setLeetCodeError(error.message || 'Failed to fetch from LeetCode. Please check the problem title/URL.');
        } finally {
            setIsLoadingLeetCode(false);
        }
    };



    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-white/60">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mr-3"></div>
            Loading Problem...
        </div>
    );

    // Options for Selects
    const topicOptions = TOPICS.map(t => ({ value: t, label: t }));
    const diffOptions = DIFFICULTIES.map(d => ({ value: d, label: d }));

    return (
        <div className="min-h-screen pb-20 px-4 md:px-6 max-w-7xl mx-auto pt-4 md:pt-6">
            {/* Top Navigation Bar */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
                <button
                    onClick={() => {
                        // If there are unsaved changes (technically we don't track dirty state perfectly, 
                        // but we can just navigate back. User should click Save first if they want to be sure.)
                        navigate('/problems');
                    }}
                    className="flex items-center text-white/60 hover:text-white transition-colors self-start"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back
                </button>

                <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
                    {/* Save Status Indicator */}
                    <div className="text-sm font-medium mr-2 hidden sm:block">
                        {saveStatus === 'saving' && <span className="text-yellow-500 animate-pulse">Saving...</span>}
                        {saveStatus === 'saved' && <span className="text-green-500 flex items-center"><Check size={14} className="mr-1" /> All changes saved</span>}
                        {saveStatus === 'revised' && <span className="text-blue-500 flex items-center">🎉 Revision Recorded!</span>}
                        {saveStatus === 'error' && <span className="text-red-500 flex items-center">Error saving</span>}
                    </div>

                    {id !== 'new' && (
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            {/* Manual Save Button */}
                            <button
                                onClick={handleSave} // Reuse the save logic, it does exactly what we want
                                disabled={saveStatus === 'saving'}
                                className="flex-1 md:flex-none justify-center bg-primary hover:bg-primary/80 text-white font-medium px-4 py-2 rounded-lg flex items-center transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                <Check size={16} className="mr-2" />
                                Save
                            </button>

                            {/* Mark as Solved Toggle */}
                            <button
                                onClick={() => setFormData({ ...formData, isSolved: !formData.isSolved })}
                                className={`flex-1 md:flex-none justify-center px-4 py-2 rounded-lg flex items-center transition-all border whitespace-nowrap ${formData.isSolved
                                    ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                    : 'bg-white/5 text-white/60 border-white/20 hover:border-white/40'
                                    }`}
                            >
                                <Check size={16} className="mr-2" />
                                {formData.isSolved ? 'Solved' : 'Solve'}
                            </button>

                            <button
                                onClick={handleMarkRevised}
                                className="flex-1 md:flex-none justify-center bg-white/5 hover:bg-white/10 text-white border border-white/20 px-4 py-2 rounded-lg flex items-center transition-all whitespace-nowrap"
                            >
                                <RefreshCw size={16} className="mr-2" />
                                Mark Revised
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-2 text-white/40 hover:text-red-400 transition-colors ml-auto md:ml-0"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Metadata & Settings (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Main Info Card */}
                    <div className="glass-card p-6 space-y-5">
                        <div className="border-b border-white/10 pb-4 mb-4">
                            <input
                                className="w-full bg-transparent text-2xl font-bold text-white placeholder-white/20 outline-none"
                                placeholder="Problem Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                            {id !== 'new' && (
                                <div className="flex items-center mt-2 text-sm text-white/40 gap-3">
                                    <span>Added {new Date(problemMetadata?.createdAt || Date.now()).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{problemMetadata?.revision_count || 0} Revisions</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="relative z-[60]">
                                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Topic</label>
                                <CustomSelect
                                    options={topicOptions}
                                    value={formData.topic}
                                    onChange={(v) => setFormData({ ...formData, topic: v })}
                                    placeholder="Select Topic"
                                />
                            </div>

                            <div className="relative z-[50]">
                                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Difficulty</label>
                                <CustomSelect
                                    options={diffOptions}
                                    value={formData.difficulty}
                                    onChange={(v) => setFormData({ ...formData, difficulty: v })}
                                    placeholder="Select Difficulty"
                                />
                            </div>

                            {/* Complexity Section */}
                            <div className="grid grid-cols-2 gap-4 relative z-[20]">
                                <div>
                                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Time Comp.</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 placeholder-white/20"
                                        placeholder="O(n)"
                                        value={formData.timeComplexity}
                                        onChange={(e) => setFormData({ ...formData, timeComplexity: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Space Comp.</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 placeholder-white/20"
                                        placeholder="O(1)"
                                        value={formData.spaceComplexity}
                                        onChange={(e) => setFormData({ ...formData, spaceComplexity: e.target.value })}
                                    />
                                </div>
                            </div>


                            <div className="relative z-[40]">
                                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Patterns</label>
                                <CustomSelect
                                    options={availablePatterns.map(p => ({ value: p, label: p }))}
                                    isMulti={true}
                                    selectedValues={formData.patterns}
                                    onRemove={(val) => setFormData(prev => ({ ...prev, patterns: prev.patterns.filter(p => p !== val) }))}
                                    onChange={(val) => {
                                        // Toggle logic
                                        if (formData.patterns.includes(val)) {
                                            setFormData(prev => ({ ...prev, patterns: prev.patterns.filter(p => p !== val) }));
                                        } else {
                                            setFormData(prev => ({ ...prev, patterns: [...prev.patterns, val] }));
                                        }
                                    }}
                                    placeholder="Select Patterns..."
                                />
                            </div>

                            <div className="relative z-[30]">
                                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Companies</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.companies.map(c => (
                                        <span key={c} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs flex items-center gap-1 border border-blue-500/30">
                                            {c}
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, companies: prev.companies.filter(item => item !== c) }))}
                                                className="hover:text-white"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    className="w-full bg-[#1C1C1E] border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80 focus:border-primary/50 outline-none transition-colors"
                                    placeholder="Type company & press Enter"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = e.target.value.trim();
                                            if (val && !formData.companies.includes(val)) {
                                                setFormData(prev => ({ ...prev, companies: [...prev.companies, val] }));
                                                e.target.value = '';
                                            }
                                        }
                                    }}
                                />
                            </div>

                            {/* Hints Accordion */}
                            {formData.hints && formData.hints.length > 0 && (
                                <div className="border-t border-white/10 pt-4 mt-4">
                                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Hints</label>
                                    <div className="space-y-2">
                                        {formData.hints.map((hint, idx) => (
                                            <details key={idx} className="group glass-card overflow-hidden">
                                                <summary className="flex items-center justify-between p-3 cursor-pointer select-none">
                                                    <span className="text-sm font-medium text-white/80">Hint {idx + 1}</span>
                                                    <Tag size={14} className="text-white/40 group-open:text-primary transition-colors" />
                                                </summary>
                                                <div className="px-3 pb-3 text-sm text-white/60 leading-relaxed bg-black/20 pt-2 border-t border-white/5">
                                                    {hint}
                                                </div>
                                            </details>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Related Problems */}
                            {relatedProblems && relatedProblems.length > 0 && (
                                <div className="border-t border-white/10 pt-4 mt-4">
                                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Related Problems</label>
                                    <div className="space-y-2">
                                        {relatedProblems.map(rp => (
                                            <div
                                                key={rp._id}
                                                onClick={() => navigate(`/problems/${rp._id}`)}
                                                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                                            >
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${rp.difficulty === 'Easy' ? 'bg-green-500' :
                                                        rp.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`} />
                                                    <span className="text-sm text-white/80 truncate group-hover:text-primary transition-colors">{rp.title}</span>
                                                </div>
                                                {rp.isSolved && <Check size={12} className="text-green-500 flex-shrink-0" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Complexity & Stats Card */}
                    <div className="glass-card p-6 space-y-4">
                        <h3 className="text-lg font-semibold flex items-center text-white/90">
                            <Box size={18} className="mr-2 text-accent" /> Complexity Analysis
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Time</label>
                                <div className="relative">
                                    <Clock size={14} className="absolute left-3 top-3 text-white/40" />
                                    <input
                                        className="w-full bg-[#1C1C1E] border border-white/20 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:border-primary/50 outline-none transition-colors"
                                        placeholder="e.g. O(n)"
                                        value={formData.timeComplexity}
                                        onChange={(e) => setFormData({ ...formData, timeComplexity: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Space</label>
                                <div className="relative">
                                    <Box size={14} className="absolute left-3 top-3 text-white/40" />
                                    <input
                                        className="w-full bg-[#1C1C1E] border border-white/20 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:border-primary/50 outline-none transition-colors"
                                        placeholder="e.g. O(1)"
                                        value={formData.spaceComplexity}
                                        onChange={(e) => setFormData({ ...formData, spaceComplexity: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Links & Dates */}
                    <div className="glass-card p-6 space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block rounded">Link to Problem</label>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 bg-[#1C1C1E] border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80 focus:border-primary/50 outline-none"
                                    placeholder="https://leetcode.com/..."
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                />
                                {formData.url && (
                                    <a
                                        href={formData.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                    >
                                        <ExternalLink size={18} />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">Next Revision</label>
                            <input
                                type="date"
                                className="w-full bg-[#1C1C1E] border border-white/20 rounded-lg px-3 py-2 text-sm text-white/80 focus:border-primary/50 outline-none"
                                value={formData.next_reminder_date}
                                onChange={(e) => setFormData({ ...formData, next_reminder_date: e.target.value })}
                            />
                        </div>
                    </div>

                    {id === 'new' && (
                        <button
                            onClick={handleSaveNew}
                            disabled={submitting}
                            className="w-full btn-primary py-3 text-lg shadow-xl shadow-primary/20"
                        >
                            {submitting ? 'Creating...' : 'Create Problem'}
                        </button>
                    )}
                </div>

                {/* RIGHT COLUMN: Editor Area (8 cols) */}
                <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
                    <div className="glass-card flex-1 flex flex-col overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('notes')}
                                className={`flex items-center px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === 'notes' ? 'text-white' : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                <FileText size={16} className="mr-2" /> Notes
                                {activeTab === 'notes' && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                    />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('code')}
                                className={`flex items-center px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === 'code' ? 'text-white' : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                <Code size={16} className="mr-2" /> Solution Code
                                {activeTab === 'code' && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                    />
                                )}
                            </button>
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 bg-[#151517] relative">
                            {activeTab === 'notes' ? (
                                <div className="w-full h-full flex flex-col">
                                    {/* LeetCode Auto-populate Button */}
                                    {showLeetCodeButton && (
                                        <div className="p-4 border-b border-white/10 bg-[#1E1E1E] flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Sparkles size={16} className="text-primary" />
                                                <span className="text-sm text-white/70">Auto-populate from LeetCode</span>
                                            </div>
                                            <button
                                                onClick={handleAutoPopulateFromLeetCode}
                                                disabled={isLoadingLeetCode}
                                                className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {isLoadingLeetCode ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary"></div>
                                                        Loading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles size={14} />
                                                        Fetch from LeetCode
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                    {leetCodeError && (
                                        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm">
                                            {leetCodeError}
                                        </div>
                                    )}
                                    <textarea
                                        className="flex-1 w-full bg-transparent p-6 text-white/90 leading-relaxed outline-none resize-none font-sans"
                                        placeholder="# Approach & Thoughts..."
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    />
                                </div>
                            ) : (
                                <div className="flex-1 overflow-hidden h-full flex flex-col">
                                    <div className="flex items-center justify-between px-4 py-2 bg-[#1E1E1E] border-b border-white/10 shrink-0 z-10">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-white/50 lowercase bg-white/5 px-2 py-1 rounded">
                                                {formData.language || 'java'}
                                            </span>
                                            {/* Edit Toggle */}
                                            {(!formData.codeSnippet || isEditingCode) ? (
                                                <span className="text-xs text-green-400 flex items-center gap-1">
                                                    <Edit2 size={12} /> Editing
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => setIsEditingCode(true)}
                                                    className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded flex items-center gap-1 transition-colors"
                                                >
                                                    <Edit2 size={12} />
                                                    Edit Code
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isEditingCode && formData.codeSnippet && (
                                                <button
                                                    onClick={() => setIsEditingCode(false)}
                                                    className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 text-white rounded flex items-center gap-1 transition-colors"
                                                >
                                                    <Check size={12} />
                                                    Done
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(formData.codeSnippet);
                                                }}
                                                className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded flex items-center gap-1 text-white/70 hover:text-white transition-colors"
                                            >
                                                <Copy size={12} />
                                                Copy
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 relative overflow-auto">
                                        {isEditingCode || !formData.codeSnippet ? (
                                            <textarea
                                                className="w-full h-full bg-[#1E1E1E] p-6 text-white/90 leading-relaxed outline-none resize-none font-mono text-sm"
                                                placeholder="// Paste or write your solution code here..."
                                                value={formData.codeSnippet}
                                                onChange={(e) => setFormData({ ...formData, codeSnippet: e.target.value })}
                                                spellCheck="false"
                                            />
                                        ) : (
                                            <SyntaxHighlighter
                                                language={formData.language || 'java'}
                                                style={vscDarkPlus}
                                                customStyle={{
                                                    margin: 0,
                                                    padding: '1.5rem',
                                                    background: '#1E1E1E',
                                                    fontSize: '14px',
                                                    lineHeight: '1.6',
                                                    minHeight: '100%'
                                                }}
                                                showLineNumbers={true}
                                                wrapLines={true}
                                            >
                                                {formData.codeSnippet}
                                            </SyntaxHighlighter>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemDetail;
