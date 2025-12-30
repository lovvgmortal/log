import React, { useEffect, useState } from 'react';
import { CheckIcon, TrashIcon } from './Icons';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColors = {
        success: 'bg-green-500/10 border-green-500/20 text-green-400',
        error: 'bg-red-500/10 border-red-500/20 text-red-400',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    };

    const icons = {
        success: <CheckIcon className="w-5 h-5" />,
        error: <TrashIcon className="w-5 h-5" />, // Using TrashIcon as a proxy for 'error' X symbol for now if no dedicated X icon
        info: <span className="text-xl font-bold">i</span>,
    };

    return (
        <div className={`fixed top-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${bgColors[type]}`}>
            {icons[type]}
            <p className="text-sm font-semibold">{message}</p>
            <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
                ×
            </button>
        </div>
    );
};
