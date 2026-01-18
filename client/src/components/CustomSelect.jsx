import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X } from 'lucide-react';

const CustomSelect = ({
    label,
    value,
    options,
    onChange,
    placeholder = "Select option",
    className = "",
    isMulti = false,
    selectedValues = [],
    onRemove
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = !isMulti ? options.find(opt => opt.value === value) : null;

    // Determine display text for single select
    const displayText = selectedOption ? selectedOption.label : placeholder;

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && <label className="block text-sm text-white/60 mb-1">{label}</label>}

            <motion.div
                whileTap={{ scale: 0.99 }}
                onClick={(e) => {
                    // Prevent opening if clicking a remove button
                    if (e.target.closest('.remove-btn')) return;
                    setIsOpen(!isOpen);
                }}
                className={`w-full bg-[#1C1C1E] border border-white/20 rounded-lg px-3 py-2.5 text-left flex items-start justify-between hover:border-white/30 transition-colors cursor-pointer min-h-[42px] ${isOpen ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}
            >
                <div className="flex-1 flex flex-wrap gap-2">
                    {isMulti && selectedValues.length > 0 ? (
                        selectedValues.map(val => (
                            <span
                                key={val}
                                className="bg-white/10 text-white/90 px-2 py-0.5 rounded text-xs flex items-center gap-1 border border-white/10"
                            >
                                {val}
                                <button
                                    className="remove-btn hover:text-white text-white/50 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(val);
                                    }}
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className={(!isMulti && !selectedOption) || (isMulti && selectedValues.length === 0) ? "text-white/40" : "text-white"}>
                            {isMulti ? placeholder : displayText}
                        </span>
                    )}
                </div>

                <ChevronDown
                    size={16}
                    className={`text-white/60 transition-transform duration-200 mt-1 ml-2 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                />
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute z-[9999] w-full mt-2 bg-[#1C1C1E] border border-white/20 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto ring-1 ring-black/5"
                    >
                        {options.map((option) => {
                            const isSelected = isMulti
                                ? selectedValues.includes(option.value)
                                : option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        if (!isMulti) setIsOpen(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center justify-between group transition-colors bg-[#1C1C1E] text-white"
                                >
                                    <span className={isSelected ? "text-primary font-medium" : "text-white/80 group-hover:text-white"}>
                                        {option.label}
                                    </span>
                                    {isSelected && (
                                        <Check size={16} className="text-primary" />
                                    )}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomSelect;
