import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const StreakTracker = ({ streak = 0, longestStreak = 0, lastActive }) => {
    const [displayedStreak, setDisplayedStreak] = useState(0);

    // Animated counter effect
    useEffect(() => {
        if (streak === 0) {
            setDisplayedStreak(0);
            return;
        }

        let current = 0;
        const increment = streak / 30;
        const timer = setInterval(() => {
            current += increment;
            if (current >= streak) {
                setDisplayedStreak(streak);
                clearInterval(timer);
            } else {
                setDisplayedStreak(Math.floor(current));
            }
        }, 20);

        return () => clearInterval(timer);
    }, [streak]);

    const getMotivationalMessage = () => {
        if (streak === 0) return "Start your streak today!";
        if (streak < 3) return "Keep it going!";
        if (streak < 7) return "You're on fire! 🔥";
        if (streak < 14) return "Amazing consistency!";
        if (streak < 30) return "You're unstoppable! 🚀";
        return "Legendary status! 👑";
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6"
        >
            <h3 className="text-2xl font-bold mb-6">Revision Streak</h3>

            <div className="flex items-center justify-center gap-8 mb-8">
                {/* Current Streak */}
                <div className="text-center">
                    <motion.div
                        key={displayedStreak}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                    >
                        <div className="text-6xl font-bold text-gradient mb-2">
                            {displayedStreak}
                        </div>
                        {streak > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-4xl"
                            >
                                🔥
                            </motion.div>
                        )}
                    </motion.div>
                    <div className="text-white/60">Current Streak</div>
                    <div className="text-sm text-primary mt-2">{getMotivationalMessage()}</div>
                </div>

                {/* Longest Streak */}
                <div className="text-center border-l border-white/20 pl-8">
                    <div className="text-4xl font-bold text-white/80 mb-2">
                        {longestStreak}
                    </div>
                    <div className="text-white/60">Best Streak</div>
                    {longestStreak > streak && (
                        <div className="text-xs text-white/40 mt-2">
                            Can you beat it?
                        </div>
                    )}
                </div>
            </div>

            {/* Progress bar to next milestone */}
            {streak > 0 && (
                <div className="mt-6">
                    <div className="flex justify-between text-sm text-white/60 mb-2">
                        <span>Next milestone</span>
                        <span>{getNextMilestone(streak)} days</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(streak % 7) * (100 / 7)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-primary to-secondary"
                        />
                    </div>
                </div>
            )}

            {/* Achievements */}
            <div className="mt-6 grid grid-cols-2 gap-3">
                {getAchievements(streak).map((achievement, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-lg border ${achievement.unlocked
                                ? 'bg-primary/10 border-primary/30'
                                : 'bg-white/5 border-white/10 opacity-50'
                            }`}
                    >
                        <div className="text-2xl mb-1">{achievement.icon}</div>
                        <div className="text-xs font-semibold">{achievement.name}</div>
                        <div className="text-xs text-white/40">{achievement.requirement}</div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

const getNextMilestone = (streak) => {
    const milestones = [7, 14, 30, 60, 90, 180, 365];
    for (let milestone of milestones) {
        if (streak < milestone) {
            return milestone;
        }
    }
    return streak + 365;
};

const getAchievements = (streak) => {
    return [
        {
            icon: '🌱',
            name: 'Getting Started',
            requirement: '3 days',
            unlocked: streak >= 3
        },
        {
            icon: '🔥',
            name: 'On Fire',
            requirement: '7 days',
            unlocked: streak >= 7
        },
        {
            icon: '⚡',
            name: 'Power User',
            requirement: '14 days',
            unlocked: streak >= 14
        },
        {
            icon: '🚀',
            name: 'Unstoppable',
            requirement: '30 days',
            unlocked: streak >= 30
        },
        {
            icon: '💎',
            name: 'Diamond',
            requirement: '60 days',
            unlocked: streak >= 60
        },
        {
            icon: '👑',
            name: 'Legend',
            requirement: '90 days',
            unlocked: streak >= 90
        }
    ];
};

export default StreakTracker;
