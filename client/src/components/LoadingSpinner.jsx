import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-white/60">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
