import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        warning: <AlertCircle size={20} />,
        info: <Info size={20} />
    };

    const colors = {
        success: 'bg-green-500/20 border-green-500/50 text-green-400',
        error: 'bg-red-500/20 border-red-500/50 text-red-400',
        warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
        info: 'bg-blue-500/20 border-blue-500/50 text-blue-400'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-xl shadow-2xl ${colors[type]}`}
        >
            {icons[type]}
            <span className="flex-1 font-medium">{message}</span>
            <button onClick={onClose} className="hover:opacity-70 transition-opacity">
                <X size={18} />
            </button>
        </motion.div>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-md">
            <AnimatePresence>
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

// Hook for using toasts
export const useToast = () => {
    const [toasts, setToasts] = React.useState([]);

    const addToast = React.useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = React.useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return { toasts, addToast, removeToast, ToastContainer };
};

export default ToastContainer;
