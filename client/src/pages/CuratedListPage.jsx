import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaChevronDown, FaChevronUp, FaCheckCircle, FaRegCircle,
    FaExternalLinkAlt, FaPlus, FaTrophy, FaChartLine
} from 'react-icons/fa';
import listService from '../services/listService';


const CuratedListsPage = () => {
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    // Add Problem Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const [newProblem, setNewProblem] = useState({
        title: '',
        url: '',
        platform: 'LeetCode',
        difficulty: 'Medium'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchList = async () => {
            try {
                // Hardcoding "Sarthak's List" for now as per requirement
                const data = await listService.getListByName("Sarthak's List");
                setList(data);
                // Expand first section by default
                if (data?.sections?.length > 0) {
                    setExpandedSections({ [data.sections[0]._id]: true });
                }
            } catch (err) {
                console.error("Error fetching list:", err);
                setError("Could not load the list. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchList();
    }, []);

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
        }));
    };

    const openAddModal = (sectionTitle) => {
        setSelectedSection(sectionTitle);
        setNewProblem({ title: '', url: '', platform: 'LeetCode', difficulty: 'Medium' });
        setIsModalOpen(true);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSection || !list) return;

        setSubmitting(true);
        try {
            const updatedList = await listService.addProblemToList(list._id, selectedSection, newProblem);
            setList(updatedList);
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to add problem:", err);
            alert("Failed to add problem. Please check console.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    if (!list) return null;

    // Calculate total progress
    let totalProblems = 0;
    let completedProblems = 0;
    list.sections.forEach(section => {
        section.problems.forEach(p => {
            totalProblems++;
            if (p.isCompleted) completedProblems++;
        });
    });
    const progressPercentage = totalProblems === 0 ? 0 : Math.round((completedProblems / totalProblems) * 100);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 md:p-12 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-purple-500 mb-4">
                        {list.name}
                    </h1>
                    <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                        {list.description || "Master DSA with this curated collection of patterns and problems."}
                    </p>

                    {/* Overall Progress */}
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 shadow-xl max-w-3xl mx-auto">
                        <div className="flex justify-between items-end mb-2">
                            <div className="flex items-center gap-2">
                                <FaTrophy className="text-yellow-400 text-xl" />
                                <span className="font-semibold text-gray-200">Overall Progress</span>
                            </div>
                            <span className="text-2xl font-bold text-primary-400">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-gradient-to-r from-primary-500 to-purple-600 h-full rounded-full"
                            />
                        </div>
                        <div className="text-right text-sm text-gray-500 mt-2">
                            {completedProblems} / {totalProblems} Problems Solved
                        </div>
                    </div>
                </motion.div>

                {/* Sections */}
                <div className="space-y-6">
                    {list.sections.map((section, index) => (
                        <motion.div
                            key={section._id || index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden backdrop-blur-sm"
                        >
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section._id)}
                                className="w-full p-6 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary-500/10 p-3 rounded-lg text-primary-400">
                                        <FaChartLine />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-xl font-bold text-gray-100">{section.title}</h3>
                                        <p className="text-sm text-gray-500">{section.problems.length} Problems</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Mini Progress for Section */}
                                    {/* <div className="hidden md:block w-32 bg-gray-700 rounded-full h-2"> ... </div> */}
                                    {expandedSections[section._id] ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                                </div>
                            </button>

                            {/* Section Content */}
                            <AnimatePresence>
                                {expandedSections[section._id] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="border-t border-gray-700/50"
                                    >
                                        <div className="p-4 md:p-6 space-y-2">
                                            {section.problems.map((problem, pIndex) => (
                                                <div
                                                    key={pIndex}
                                                    className="group flex items-center justify-between p-4 bg-gray-900/50 rounded-lg hover:bg-gray-800 transition-all border border-transparent hover:border-gray-700"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <button className="text-gray-500 hover:text-green-500 transition-colors">
                                                            {problem.isCompleted ? <FaCheckCircle className="text-green-500 text-lg" /> : <FaRegCircle className="text-lg" />}
                                                        </button>
                                                        <div>
                                                            <a
                                                                href={problem.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="font-medium text-gray-200 group-hover:text-primary-400 transition-colors"
                                                            >
                                                                {problem.title}
                                                            </a>
                                                            <div className="flex gap-2 text-xs mt-1">
                                                                <span className={`px-2 py-0.5 rounded-full ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                                                                    problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                                                                        problem.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' :
                                                                            'bg-gray-700 text-gray-400'
                                                                    }`}>
                                                                    {problem.difficulty || 'Unknown'}
                                                                </span>
                                                                <span className="px-2 py-0.5 bg-gray-700 rounded-full text-gray-400">
                                                                    {problem.platform}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <a
                                                        href={problem.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-500 hover:text-white transition-colors"
                                                    >
                                                        <FaExternalLinkAlt size={14} />
                                                    </a>
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => openAddModal(section.title)}
                                                className="w-full py-3 mt-2 border-2 border-dashed border-gray-700 rounded-lg text-gray-500 hover:text-primary-400 hover:border-primary-500/50 hover:bg-gray-800/50 transition-all flex items-center justify-center gap-2"
                                            >
                                                <FaPlus /> <span>Add Problem to {section.title}</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Add Problem Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 p-6"
                            >
                                <h2 className="text-2xl font-bold text-white mb-6">Add Problem</h2>
                                <form onSubmit={handleAddSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Problem Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={newProblem.title}
                                            onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                                            placeholder="e.g. Two Sum"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Problem URL</label>
                                        <input
                                            type="url"
                                            required
                                            value={newProblem.url}
                                            onChange={(e) => setNewProblem({ ...newProblem, url: e.target.value })}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                                            placeholder="https://leetcode.com/problems/..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Platform</label>
                                            <select
                                                value={newProblem.platform}
                                                onChange={(e) => setNewProblem({ ...newProblem, platform: e.target.value })}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                                            >
                                                <option value="LeetCode">LeetCode</option>
                                                <option value="GeeksForGeeks">GeeksForGeeks</option>
                                                <option value="CodeStudio">CodeStudio</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Difficulty</label>
                                            <select
                                                value={newProblem.difficulty}
                                                onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                                            >
                                                <option value="Easy">Easy</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Hard">Hard</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-6 py-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                                        >
                                            {submitting ? 'Adding...' : 'Add Problem'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CuratedListsPage;
