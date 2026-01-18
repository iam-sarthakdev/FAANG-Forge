import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchProblems } from '../services/api';

const CompaniesPage = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const data = await fetchProblems();
            if (data && data.problems) {
                // Aggregate companies
                const companyMap = new Map();
                data.problems.forEach(problem => {
                    if (problem.companies && problem.companies.length > 0) {
                        problem.companies.forEach(company => {
                            const count = companyMap.get(company) || 0;
                            companyMap.set(company, count + 1);
                        });
                    }
                });

                // Convert to array and sort by count (desc) then name (asc)
                const sortedCompanies = Array.from(companyMap.entries())
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

                setCompanies(sortedCompanies);
            }
        } catch (err) {
            console.error('Failed to load companies:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                        Companies
                    </h1>
                    <p className="text-white/60 mt-1">
                        Practice problems frequently asked by top tech companies
                    </p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredCompanies.length > 0 ? (
                        filteredCompanies.map((company) => (
                            <motion.div
                                key={company.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                layout
                                onClick={() => navigate(`/problems?company=${encodeURIComponent(company.name)}`)}
                                className="glass-card p-4 cursor-pointer group flex items-center justify-between hover:border-primary/30 transition-all duration-300"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-white/5 to-white/10 group-hover:from-primary/10 group-hover:to-purple-500/10 transition-colors">
                                        <Building2 className="text-primary" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white/90 group-hover:text-white transition-colors">
                                            {company.name}
                                        </h3>
                                        <span className="text-xs text-white/50">
                                            {company.count} problems
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="text-white/20 group-hover:text-primary transition-colors" size={18} />
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-white/40">
                            No companies found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CompaniesPage;
