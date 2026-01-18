import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon, label, value, suffix = '', color = 'primary', delay = 0 }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (value === 0) {
            setDisplayValue(0);
            return;
        }

        let current = 0;
        const increment = value / 30;
        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(current));
            }
        }, 20);

        return () => clearInterval(timer);
    }, [value]);

    const colorClasses = {
        primary: 'from-blue-500 to-purple-500',
        secondary: 'from-purple-500 to-pink-500',
        success: 'from-green-500 to-emerald-500',
        warning: 'from-yellow-500 to-orange-500'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="glass-card p-6 cursor-pointer"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`text-4xl p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} bg-opacity-10`}>
                    {icon}
                </div>
            </div>

            <motion.div
                key={displayValue}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3 }}
                className="text-4xl font-bold text-gradient mb-2"
            >
                {displayValue}{suffix}
            </motion.div>

            <div className="text-white/60 text-sm">{label}</div>
        </motion.div>
    );
};

export default StatCard;
