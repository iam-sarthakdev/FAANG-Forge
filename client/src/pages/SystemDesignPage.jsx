import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Sidebar from '../components/SystemDesign/Sidebar';
import ContentRenderer from '../components/SystemDesign/ContentRenderer';
import LoadingSpinner from '../components/LoadingSpinner';
import { systemDesignAPI } from '../services/api';

const SystemDesignPage = () => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('system-design-topics-start-here');
    const [activeFile, setActiveFile] = useState('index.md');
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop
    const [isMobile, setIsMobile] = useState(false);

    // Progress State
    const [completedTopics, setCompletedTopics] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(true);

    // Handle responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setIsSidebarOpen(false);
            else setIsSidebarOpen(true);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch Progress
    useEffect(() => {
        const loadProgress = async () => {
            try {
                setLoadingProgress(true);
                const data = await systemDesignAPI.getProgress();
                setCompletedTopics(data.completedTopics || []);
            } catch (err) {
                console.error("Failed to load progress:", err);
            } finally {
                setLoadingProgress(false);
            }
        };
        loadProgress();
    }, []);

    const handleToggle = async (topicId) => {
        try {
            // Optimistic Update
            const isCompleted = completedTopics.includes(topicId);
            let newTopics;
            if (isCompleted) {
                newTopics = completedTopics.filter(id => id !== topicId);
            } else {
                newTopics = [...completedTopics, topicId];
            }
            setCompletedTopics(newTopics);

            // API Call
            await systemDesignAPI.toggleTopic(topicId);
        } catch (err) {
            console.error("Failed to toggle topic:", err);
            // Revert on error could be added here
        }
    };

    // Fetch content when activeFile changes
    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            setError(null);
            try {
                // Remove any leading/trailing slashes or dots
                let filePath = activeFile;

                // If fetching index.md (main page)
                if (filePath === 'index.md') {
                    // It is at /system-design-data/index.md
                } else if (!filePath.startsWith('http')) {
                    // Ensure it points to system-design-data
                    // If it comes from sidebar (e.g. 'solutions/system_design/pastebin/README.md')
                    // It should be prepended
                }

                const url = activeFile === 'index.md'
                    ? '/system-design-data/index.md'
                    : `/system-design-data/${activeFile}`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to load content');
                }
                const text = await response.text();
                setContent(text);
            } catch (err) {
                console.error('Error loading content:', err);
                setError('Failed to load content. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [activeFile]);

    // Handle section changes from Sidebar or clicking internal links
    const handleSectionChange = (itemOrLink) => {
        // If it's an object from sidebar
        if (typeof itemOrLink === 'object') {
            if (itemOrLink.file) {
                // It's a file link
                setActiveFile(itemOrLink.file);
                setActiveSection(null);
            } else if (itemOrLink.id) {
                // It's a section in the main README
                setActiveFile('index.md');
                setActiveSection(itemOrLink.id);
                // We need to wait for content to load if not already index.md, then scroll
                // But for now, we just set state. If content is same, we scroll.
                setTimeout(() => {
                    const element = document.getElementById(itemOrLink.id);
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }

            if (isMobile) setIsSidebarOpen(false);
        } else if (typeof itemOrLink === 'string') {
            // It's a string link from inside markdown
            // e.g. "solutions/system_design/pastebin/README.md" or "#section-id"

            if (itemOrLink.startsWith('#')) {
                // Anchor link in same file
                const id = itemOrLink.substring(1);
                const element = document.getElementById(id);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            } else {
                // File link
                // Clean up path
                let path = itemOrLink;
                if (path.startsWith('./')) path = path.slice(2);

                setActiveFile(path);
                window.scrollTo(0, 0);
            }
        }
    };

    // Effect to scroll to section after content load if activeSection is set
    useEffect(() => {
        if (!loading && activeSection && activeFile === 'index.md') {
            // Small timeout to allow render
            setTimeout(() => {
                const element = document.getElementById(activeSection);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [loading, activeSection, activeFile]);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#0a0a0b]">
            {/* Mobile Toggle */}
            {isMobile && (
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="fixed bottom-6 right-6 z-50 p-3 bg-primary text-white rounded-full shadow-lg"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            )}

            {/* Sidebar */}
            <AnimatePresence mode='wait'>
                {(isSidebarOpen || !isMobile) && (
                    <motion.div
                        initial={isMobile ? { x: -300, opacity: 0 } : false}
                        animate={{ x: 0, opacity: 1 }}
                        exit={isMobile ? { x: -300, opacity: 0 } : false}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`
                            ${isMobile ? 'fixed inset-y-0 left-0 z-40 w-[80%] max-w-sm pt-16' : 'w-80 relative'}
                            h-full flex-shrink-0
                        `}
                    >
                        <Sidebar
                            activeSection={activeSection}
                            activeFile={activeFile}
                            onSectionChange={handleSectionChange}
                            completedTopics={completedTopics}
                            onToggle={handleToggle}
                            loadingProgress={loadingProgress}
                            className="bg-[#0a0a0b]/95 h-full"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop for mobile */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto min-w-0 custom-scrollbar">
                <div className="max-w-4xl mx-auto px-6 py-10">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <LoadingSpinner />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <h3 className="text-xl font-bold text-red-400 mb-2">Error</h3>
                            <p className="text-gray-400">{error}</p>
                            <button
                                onClick={() => setActiveFile('index.md')}
                                className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
                            >
                                Return to Index
                            </button>
                        </div>
                    ) : (
                        <ContentRenderer
                            content={content}
                            onLinkClick={handleSectionChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SystemDesignPage;
