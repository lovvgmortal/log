import React from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    danger?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'OK',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    danger = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-zinc-400 mb-6">{message}</p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${danger
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-white hover:bg-zinc-200 text-black'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
