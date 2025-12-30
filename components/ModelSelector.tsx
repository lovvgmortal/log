import React from 'react';
import { AI_MODELS } from '../constants';

interface Props {
    value?: string;
    onChange: (model: string) => void;
    label: string;
    className?: string;
}

export const ModelSelector: React.FC<Props> = ({ value, onChange, label, className = '' }) => {
    return (
        <div className={`flex flex-col ${className}`}>
            <label className="text-xs font-bold text-zinc-500 uppercase mb-2">{label}</label>
            <select
                value={value || AI_MODELS[0].id}
                onChange={(e) => onChange(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:outline-none transition-colors hover:border-zinc-600"
            >
                {AI_MODELS.map(m => (
                    <option key={m.id} value={m.id}>
                        {m.name} ({m.provider})
                    </option>
                ))}
            </select>
        </div>
    );
};
