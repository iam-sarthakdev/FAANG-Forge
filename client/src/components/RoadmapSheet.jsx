import React, { useState, useCallback, useMemo } from 'react';
import {
    ChevronDown, ExternalLink, CheckCircle, Circle,
    PlayCircle, FileText, Search, BookOpen
} from 'lucide-react';

const STORAGE_KEY_PREFIX = 'faang-forge-roadmap-';

const RoadmapSheet = ({ title, subtitle, icon: Icon, accentColor, sections, storageKey }) => {
    const fullStorageKey = STORAGE_KEY_PREFIX + storageKey;

    // Load completed topics from localStorage
    const [completed, setCompleted] = useState(() => {
        try {
            const stored = localStorage.getItem(fullStorageKey);
            return stored ? JSON.parse(stored) : {};
        } catch { return {}; }
    });

    const [expandedSections, setExpandedSections] = useState(() => {
        const init = {};
        if (sections.length > 0) init[sections[0].id] = true;
        return init;
    });

    const [searchQuery, setSearchQuery] = useState('');

    const toggleSection = useCallback((id) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    }, []);

    const toggleCompleted = useCallback((topicId) => {
        setCompleted(prev => {
            const next = { ...prev, [topicId]: !prev[topicId] };
            try { localStorage.setItem(fullStorageKey, JSON.stringify(next)); } catch {}
            return next;
        });
    }, [fullStorageKey]);

    // Stats
    const totalTopics = useMemo(() => sections.reduce((acc, s) => acc + s.topics.length, 0), [sections]);
    const completedCount = useMemo(() => Object.values(completed).filter(Boolean).length, [completed]);
    const progressPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

    // Search filter
    const filteredSections = useMemo(() => {
        if (!searchQuery.trim()) return sections;
        const q = searchQuery.toLowerCase();
        return sections.map(s => ({
            ...s,
            topics: s.topics.filter(t => t.title.toLowerCase().includes(q))
        })).filter(s => s.topics.length > 0);
    }, [sections, searchQuery]);

    return (
        <div className="min-h-screen bg-[#030014] text-white p-6 md:p-10 font-sans selection:bg-fuchsia-500/30 relative">
            {/* Background glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full blur-[120px]"
                    style={{ background: `${accentColor}10` }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px]"
                    style={{ background: `${accentColor}08` }} />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] mb-5 backdrop-blur-sm">
                        <Icon size={18} style={{ color: accentColor }} />
                        <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">{subtitle}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">{title}</h1>
                    <p className="text-slate-400 text-base max-w-xl mx-auto">
                        Track your progress across all topics. Click the checkbox to mark a topic as complete.
                    </p>
                </div>

                {/* Progress + Search Bar */}
                <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-5 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-5">
                        {/* Progress */}
                        <div className="flex-1 w-full">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-slate-300">Overall Progress</span>
                                <span className="text-sm font-bold" style={{ color: accentColor }}>{completedCount}/{totalTopics} completed</span>
                            </div>
                            <div className="h-2.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                    style={{ width: `${progressPct}%`, background: accentColor }}
                                />
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-72">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search topics..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-slate-600 focus:border-white/15 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-3">
                    {filteredSections.map((section) => {
                        const isExpanded = expandedSections[section.id];
                        const sectionCompleted = section.topics.filter(t => completed[t.id]).length;
                        const sectionTotal = section.topics.length;
                        const sectionPct = sectionTotal > 0 ? Math.round((sectionCompleted / sectionTotal) * 100) : 0;

                        return (
                            <div key={section.id} className="bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.1] transition-colors">
                                {/* Section Header */}
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full p-4 md:p-5 flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div
                                            className="w-2 h-10 rounded-full flex-shrink-0 transition-opacity"
                                            style={{ background: section.color, opacity: isExpanded ? 1 : 0.4 }}
                                        />
                                        <div className="flex-1 min-w-0 text-left">
                                            <h3 className={`text-base md:text-lg font-semibold transition-colors ${isExpanded ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                                {section.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-md border"
                                                    style={{
                                                        color: section.color,
                                                        borderColor: `${section.color}30`,
                                                        background: `${section.color}08`
                                                    }}
                                                >
                                                    {sectionCompleted}/{sectionTotal}
                                                </span>
                                                <div className="h-1 flex-1 max-w-[120px] bg-white/[0.04] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${sectionPct}%`, background: section.color }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`p-1.5 rounded-md bg-white/[0.04] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={18} className="text-slate-400" />
                                    </div>
                                </button>

                                {/* Topic Rows */}
                                {isExpanded && (
                                    <div className="border-t border-white/[0.04]">
                                        {/* Table Header */}
                                        <div className="hidden md:grid grid-cols-12 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-white/[0.02]">
                                            <span className="col-span-1 text-center">Status</span>
                                            <span className="col-span-1 text-center">#</span>
                                            <span className="col-span-7">Topic</span>
                                            <span className="col-span-1 text-center">Type</span>
                                            <span className="col-span-2 text-center">Resource</span>
                                        </div>

                                        {section.topics.map((topic, idx) => {
                                            const isDone = completed[topic.id];
                                            return (
                                                <div
                                                    key={topic.id}
                                                    className={`group grid grid-cols-1 md:grid-cols-12 items-center px-5 py-3.5 border-b border-white/[0.03] last:border-b-0 transition-colors ${isDone ? 'bg-white/[0.015]' : 'hover:bg-white/[0.02]'
                                                        }`}
                                                >
                                                    {/* Checkbox */}
                                                    <div className="hidden md:flex col-span-1 justify-center">
                                                        <button
                                                            onClick={() => toggleCompleted(topic.id)}
                                                            className="transition-transform active:scale-90"
                                                        >
                                                            {isDone
                                                                ? <CheckCircle size={22} className="text-green-500" fill="currentColor" />
                                                                : <Circle size={22} className="text-slate-600 hover:text-slate-400" strokeWidth={1.5} />
                                                            }
                                                        </button>
                                                    </div>

                                                    {/* Index */}
                                                    <div className="hidden md:flex col-span-1 justify-center">
                                                        <span className="text-xs font-mono text-slate-600">{idx + 1}</span>
                                                    </div>

                                                    {/* Topic Title */}
                                                    <div className="col-span-7 flex items-center gap-3 min-w-0">
                                                        {/* Mobile checkbox */}
                                                        <button
                                                            onClick={() => toggleCompleted(topic.id)}
                                                            className="md:hidden transition-transform active:scale-90 flex-shrink-0"
                                                        >
                                                            {isDone
                                                                ? <CheckCircle size={20} className="text-green-500" fill="currentColor" />
                                                                : <Circle size={20} className="text-slate-600" strokeWidth={1.5} />
                                                            }
                                                        </button>
                                                        <span className={`text-sm font-medium truncate ${isDone ? 'text-slate-500 line-through decoration-slate-700' : 'text-slate-200'}`}>
                                                            {topic.title}
                                                        </span>
                                                    </div>

                                                    {/* Type Badge */}
                                                    <div className="hidden md:flex col-span-1 justify-center">
                                                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${topic.type === 'video'
                                                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                            }`}>
                                                            {topic.type === 'video' ? <PlayCircle size={10} /> : <FileText size={10} />}
                                                            {topic.type === 'video' ? 'Video' : 'Article'}
                                                        </span>
                                                    </div>

                                                    {/* Resource Link */}
                                                    <div className="hidden md:flex col-span-2 justify-center">
                                                        <a
                                                            href={topic.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-white px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-white/[0.1] transition-all"
                                                        >
                                                            <ExternalLink size={12} />
                                                            Open
                                                        </a>
                                                    </div>

                                                    {/* Mobile Type + Link */}
                                                    <div className="flex md:hidden items-center gap-2 mt-2 pl-8">
                                                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${topic.type === 'video'
                                                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                            }`}>
                                                            {topic.type === 'video' ? <PlayCircle size={10} /> : <FileText size={10} />}
                                                            {topic.type === 'video' ? 'Video' : 'Article'}
                                                        </span>
                                                        <a
                                                            href={topic.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-white px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.05] transition-colors"
                                                        >
                                                            <ExternalLink size={10} />
                                                            Open
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Empty state */}
                {filteredSections.length === 0 && (
                    <div className="text-center py-20">
                        <Search size={48} className="mx-auto text-slate-700 mb-4" />
                        <p className="text-slate-500">No topics match "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoadmapSheet;
