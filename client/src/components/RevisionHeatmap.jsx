import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import './heatmap.css';

const RevisionHeatmap = ({ revisions = [] }) => {
    // Generate heatmap data for last 365 days
    const endDate = new Date();
    const startDate = subDays(endDate, 365);

    // Process revisions into daily counts
    const revisionsByDate = {};

    revisions.forEach(revision => {
        const date = format(new Date(revision.revised_at), 'yyyy-MM-dd');
        revisionsByDate[date] = (revisionsByDate[date] || 0) + 1;
    });

    // Convert to heatmap format
    const values = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, 'yyyy-MM-dd');
        values.push({
            date: dateStr,
            count: revisionsByDate[dateStr] || 0
        });
    }

    // Get tooltip content
    const getTooltip = (value) => {
        if (!value || !value.date) return null;
        const date = format(new Date(value.date), 'MMM d, yyyy');
        const count = value.count || 0;
        return `${count} revision${count !== 1 ? 's' : ''} on ${date}`;
    };

    // Get class name for color intensity
    const getClassForValue = (value) => {
        if (!value || value.count === 0) {
            return 'color-empty';
        }
        if (value.count <= 2) {
            return 'color-scale-1';
        }
        if (value.count <= 4) {
            return 'color-scale-2';
        }
        if (value.count <= 6) {
            return 'color-scale-3';
        }
        return 'color-scale-4';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-card p-6"
        >
            <h3 className="text-2xl font-bold mb-4">Revision Activity</h3>
            <p className="text-white/60 mb-6">Your revision history over the last year</p>

            <div className="heatmap-container">
                <CalendarHeatmap
                    startDate={startDate}
                    endDate={endDate}
                    values={values}
                    classForValue={getClassForValue}
                    tooltipDataAttrs={(value) => {
                        return {
                            'data-tip': getTooltip(value)
                        };
                    }}
                    showWeekdayLabels
                />
            </div>

            <div className="flex items-center gap-4 mt-6">
                <span className="text-sm text-white/60">Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-white/10"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-900/50"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-700/70"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                    <div className="w-3 h-3 rounded-sm bg-green-400"></div>
                </div>
                <span className="text-sm text-white/60">More</span>
            </div>

        </motion.div>
    );
};

export default RevisionHeatmap;
