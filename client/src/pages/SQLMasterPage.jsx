import React, { useState, useCallback, useMemo } from 'react';
import {
    ChevronDown, ExternalLink, Search, Database,
    CheckCircle, Circle, Code2, Lightbulb
} from 'lucide-react';

import { SQL_PATTERNS } from '../data/sqlMasterData';

const STORAGE_KEY = 'faang-forge-sql-master';

const SQLMasterPage = () => {
    const [completed, setCompleted] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch { return {}; }
    });

    const [expandedPatterns, setExpandedPatterns] = useState(() => {
        const init = {};
        if (SQL_PATTERNS.length > 0) init[SQL_PATTERNS[0].id] = true;
        return init;
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [diffFilter, setDiffFilter] = useState('All');
    const [showCode, setShowCode] = useState({});

    const togglePattern = useCallback((id) => {
        setExpandedPatterns(prev => ({ ...prev, [id]: !prev[id] }));
    }, []);

    const toggleCompleted = useCallback((problemKey) => {
        setCompleted(prev => {
            const next = { ...prev, [problemKey]: !prev[problemKey] };
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
            return next;
        });
    }, []);

    const toggleCode = useCallback((patternId) => {
        setShowCode(prev => ({ ...prev, [patternId]: !prev[patternId] }));
    }, []);

    // Stats
    const totalProblems = useMemo(() => SQL_PATTERNS.reduce((acc, p) => acc + p.problems.length, 0), []);
    const completedCount = useMemo(() => Object.values(completed).filter(Boolean).length, [completed]);
    const progressPct = totalProblems > 0 ? Math.round((completedCount / totalProblems) * 100) : 0;

    // Search + filter
    const filteredPatterns = useMemo(() => {
        return SQL_PATTERNS.map(pattern => {
            let problems = pattern.problems;
            if (diffFilter !== 'All') {
                problems = problems.filter(p => p.difficulty === diffFilter);
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                problems = problems.filter(p => p.title.toLowerCase().includes(q));
            }
            return { ...pattern, problems };
        }).filter(p => p.problems.length > 0 || (!searchQuery.trim() && diffFilter === 'All'));
    }, [searchQuery, diffFilter]);

    return (
        <div className="min-h-screen bg-[#030014] text-white p-6 md:p-10 font-sans selection:bg-cyan-500/30 relative">
            {/* Background glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-cyan-600/8 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] mb-5 backdrop-blur-sm">
                        <Database size={18} className="text-cyan-400" />
                        <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">SQL Interview Prep</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                        SQL Master
                    </h1>
                    <p className="text-slate-400 text-base max-w-xl mx-auto">
                        Master every SQL pattern with curated LeetCode problems. Learn the pattern, practice the problems.
                    </p>
                </div>

                {/* Progress + Search */}
                <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-5 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-5">
                        <div className="flex-1 w-full">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-slate-300">Problems Solved</span>
                                <span className="text-sm font-bold text-cyan-400">{completedCount}/{totalProblems}</span>
                            </div>
                            <div className="h-2.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700 ease-out"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-56">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search problems..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-slate-600 focus:border-white/15 focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDiffFilter(d)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${diffFilter === d
                                            ? d === 'Easy' ? 'bg-green-500/20 text-green-400'
                                                : d === 'Medium' ? 'bg-yellow-500/20 text-yellow-400'
                                                    : d === 'Hard' ? 'bg-red-500/20 text-red-400'
                                                        : 'bg-white/10 text-white'
                                            : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Patterns */}
                <div className="space-y-3">
                    {filteredPatterns.map((pattern) => {
                        const isExpanded = expandedPatterns[pattern.id];
                        const patternCompleted = pattern.problems.filter(p => completed[`${pattern.id}-${p.lc}`]).length;
                        const isCodeVisible = showCode[pattern.id];

                        return (
                            <div key={pattern.id} className="bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.1] transition-colors">
                                {/* Pattern Header */}
                                <button
                                    onClick={() => togglePattern(pattern.id)}
                                    className="w-full p-4 md:p-5 flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div
                                            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border"
                                            style={{
                                                background: pattern.colorBg,
                                                borderColor: pattern.colorBorder,
                                            }}
                                        >
                                            {pattern.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <h3 className={`text-base md:text-lg font-semibold transition-colors ${isExpanded ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                                {pattern.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-md border"
                                                    style={{
                                                        color: pattern.color,
                                                        borderColor: `${pattern.color}30`,
                                                        background: `${pattern.color}08`
                                                    }}
                                                >
                                                    {patternCompleted}/{pattern.problems.length} solved
                                                </span>
                                                <p className="text-xs text-slate-500 truncate hidden md:block">{pattern.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`p-1.5 rounded-md bg-white/[0.04] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={18} className="text-slate-400" />
                                    </div>
                                </button>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="border-t border-white/[0.04]">
                                        {/* SQL Code Example */}
                                        <div className="px-5 pt-4 pb-2">
                                            <button
                                                onClick={() => toggleCode(pattern.id)}
                                                className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors mb-2"
                                            >
                                                <Code2 size={14} />
                                                {isCodeVisible ? 'Hide' : 'Show'} SQL Pattern
                                            </button>

                                            {isCodeVisible && (
                                                <div className="rounded-xl overflow-hidden border border-white/[0.06] mb-3">
                                                    <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e0e10] border-b border-white/[0.04]">
                                                        <div className="flex gap-1.5">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                                                        </div>
                                                        <span className="text-[10px] font-mono text-slate-600 uppercase">SQL</span>
                                                    </div>
                                                    <pre className="p-4 bg-[#0a0a0c] text-sm font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                                                        <code>{pattern.sql}</code>
                                                    </pre>
                                                </div>
                                            )}

                                            {/* Tip */}
                                            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/[0.05] border border-amber-500/15 mb-3">
                                                <Lightbulb size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                                                <span className="text-xs text-amber-300/90">{pattern.tip}</span>
                                            </div>
                                        </div>

                                        {/* Problem Rows */}
                                        <div className="hidden md:grid grid-cols-12 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-white/[0.02] border-t border-white/[0.04]">
                                            <span className="col-span-1 text-center">Done</span>
                                            <span className="col-span-1 text-center">LC#</span>
                                            <span className="col-span-6">Problem</span>
                                            <span className="col-span-2 text-center">Difficulty</span>
                                            <span className="col-span-2 text-center">Link</span>
                                        </div>

                                        {pattern.problems.map((problem) => {
                                            const key = `${pattern.id}-${problem.lc}`;
                                            const isDone = completed[key];
                                            return (
                                                <div
                                                    key={key}
                                                    className={`group grid grid-cols-1 md:grid-cols-12 items-center px-5 py-3.5 border-b border-white/[0.03] last:border-b-0 transition-colors ${isDone ? 'bg-white/[0.015]' : 'hover:bg-white/[0.02]'}`}
                                                >
                                                    {/* Checkbox */}
                                                    <div className="hidden md:flex col-span-1 justify-center">
                                                        <button onClick={() => toggleCompleted(key)} className="transition-transform active:scale-90">
                                                            {isDone
                                                                ? <CheckCircle size={22} className="text-green-500" fill="currentColor" />
                                                                : <Circle size={22} className="text-slate-600 hover:text-slate-400" strokeWidth={1.5} />
                                                            }
                                                        </button>
                                                    </div>

                                                    {/* LC Number */}
                                                    <div className="hidden md:flex col-span-1 justify-center">
                                                        <span className="text-xs font-mono text-slate-500">{problem.lc}</span>
                                                    </div>

                                                    {/* Title */}
                                                    <div className="col-span-6 flex items-center gap-3 min-w-0">
                                                        <button onClick={() => toggleCompleted(key)} className="md:hidden flex-shrink-0">
                                                            {isDone
                                                                ? <CheckCircle size={20} className="text-green-500" fill="currentColor" />
                                                                : <Circle size={20} className="text-slate-600" strokeWidth={1.5} />
                                                            }
                                                        </button>
                                                        <a
                                                            href={problem.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`text-sm font-medium truncate hover:text-cyan-400 transition-colors ${isDone ? 'text-slate-500 line-through decoration-slate-700' : 'text-slate-200'}`}
                                                        >
                                                            {problem.title}
                                                        </a>
                                                    </div>

                                                    {/* Difficulty */}
                                                    <div className="hidden md:flex col-span-2 justify-center">
                                                        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md border tracking-wider ${problem.difficulty === 'Easy' ? 'bg-green-900/20 text-green-400 border-green-500/20' :
                                                            problem.difficulty === 'Medium' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20' :
                                                                'bg-red-900/20 text-red-400 border-red-500/20'
                                                            }`}>
                                                            {problem.difficulty}
                                                        </span>
                                                    </div>

                                                    {/* Link */}
                                                    <div className="hidden md:flex col-span-2 justify-center">
                                                        <a
                                                            href={problem.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-white px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-white/[0.1] transition-all"
                                                        >
                                                            <ExternalLink size={12} />
                                                            Solve
                                                        </a>
                                                    </div>

                                                    {/* Mobile extras */}
                                                    <div className="flex md:hidden items-center gap-2 mt-2 pl-8">
                                                        <span className="text-[10px] font-mono text-slate-600">LC {problem.lc}</span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${problem.difficulty === 'Easy' ? 'bg-green-900/20 text-green-400 border-green-500/20' :
                                                            problem.difficulty === 'Medium' ? 'bg-yellow-900/20 text-yellow-400 border-yellow-500/20' :
                                                                'bg-red-900/20 text-red-400 border-red-500/20'
                                                            }`}>
                                                            {problem.difficulty}
                                                        </span>
                                                        <a href={problem.url} target="_blank" rel="noopener noreferrer"
                                                            className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.05]">
                                                            <ExternalLink size={10} /> Solve
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

                {filteredPatterns.length === 0 && (
                    <div className="text-center py-20">
                        <Search size={48} className="mx-auto text-slate-700 mb-4" />
                        <p className="text-slate-500">No problems match your search/filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SQLMasterPage;
