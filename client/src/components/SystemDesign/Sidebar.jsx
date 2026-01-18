import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Layout, Database, Server, Globe, Shield, Activity, Layers, Boxes, CheckCircle2, Circle } from 'lucide-react';

const Sidebar = ({ activeSection, onSectionChange, activeFile, className = '', completedTopics = [], onToggle, loadingProgress = false }) => {
    const categories = [
        {
            title: 'Core Concepts',
            items: [
                { id: 'system-design-topics-start-here', label: 'Start Here', icon: Layout },
                { id: 'performance-vs-scalability', label: 'Performance vs Scalability', icon: Activity },
                { id: 'latency-vs-throughput', label: 'Latency vs Throughput', icon: Activity },
                { id: 'availability-vs-consistency', label: 'Availability vs Consistency', icon: Layers },
                { id: 'consistency-patterns', label: 'Consistency Patterns', icon: Database },
                { id: 'availability-patterns', label: 'Availability Patterns', icon: Server },
                { id: 'domain-name-system', label: 'DNS', icon: Globe },
                { id: 'content-delivery-network', label: 'CDN', icon: Globe },
                { id: 'load-balancer', label: 'Load Balancer', icon: Layers },
                { id: 'reverse-proxy-web-server', label: 'Reverse Proxy', icon: Server },
                { id: 'application-layer', label: 'Application Layer', icon: Boxes },
                { id: 'database', label: 'Database', icon: Database },
                { id: 'cache', label: 'Cache', icon: Database },
                { id: 'asynchronism', label: 'Asynchronism', icon: Activity },
                { id: 'communication', label: 'Communication', icon: Globe },
                { id: 'security', label: 'Security', icon: Shield },
            ]
        },
        {
            title: 'System Design Problems',
            items: [
                { file: 'solutions/system_design/pastebin/README.md', label: 'Design Pastebin/Bit.ly', icon: Layout },
                { file: 'solutions/system_design/twitter/README.md', label: 'Design Twitter/Facebook', icon: Layout },
                { file: 'solutions/system_design/web_crawler/README.md', label: 'Design Web Crawler', icon: Globe },
                { file: 'solutions/system_design/mint/README.md', label: 'Design Mint.com', icon: Database },
                { file: 'solutions/system_design/social_graph/README.md', label: 'Design Social Network', icon: Globe },
                { file: 'solutions/system_design/query_cache/README.md', label: 'Design Key-Value Store', icon: Database },
                { file: 'solutions/system_design/sales_rank/README.md', label: 'Design Sales Rank', icon: Activity },
                { file: 'solutions/system_design/scaling_aws/README.md', label: 'Scaling on AWS', icon: Server },
            ]
        }
    ];

    // Calculate progress
    const totalItems = categories.reduce((acc, cat) => acc + cat.items.length, 0);
    const completedCount = completedTopics.length;
    const progressPercentage = Math.round((completedCount / totalItems) * 100);

    const handleItemClick = (item) => {
        onSectionChange(item);
    };

    const handleToggle = (e, id) => {
        e.stopPropagation();
        onToggle(id);
    };

    return (
        <div className={`flex flex-col h-full overflow-y-auto bg-gray-900/50 backdrop-blur-sm border-r border-white/10 ${className}`}>
            <div className="p-4 border-b border-white/10">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                            System Design
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">master guide</p>
                    </div>
                    {!loadingProgress && (
                        <div className="text-right">
                            <span className="text-2xl font-bold text-white">{progressPercentage}%</span>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Mastered</p>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-purple-500"
                    />
                </div>
            </div>

            <div className="flex-1 py-4">
                {categories.map((category, idx) => (
                    <div key={idx} className="mb-6">
                        <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            {category.title}
                        </h3>
                        <div className="space-y-0.5">
                            {category.items.map((item, itemIdx) => {
                                const Icon = item.icon;
                                const id = item.id || item.file;
                                const isCompleted = completedTopics.includes(id);
                                const isActive = (item.id && activeSection === item.id) || (item.file && activeFile === item.file);

                                return (
                                    <button
                                        key={itemIdx}
                                        onClick={() => handleItemClick(item)}
                                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors relative group
                                            ${isActive
                                                ? 'text-white bg-white/10 border-r-2 border-primary'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <div
                                            onClick={(e) => handleToggle(e, id)}
                                            className={`p-1 rounded-full transition-colors ${isCompleted ? 'text-green-500' : 'text-gray-600 hover:text-gray-400'}`}
                                        >
                                            {isCompleted ? <CheckCircle2 size={16} className="fill-green-500/10" /> : <Circle size={16} />}
                                        </div>

                                        <span className={`flex-1 text-left truncate ${isCompleted ? 'text-gray-500 line-through' : ''}`}>
                                            {item.label}
                                        </span>

                                        {isActive && <ChevronRight size={14} className="text-primary" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
