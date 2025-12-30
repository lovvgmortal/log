import React, { useState } from 'react';
import { ScriptDNA } from '../types';
import { CheckIcon, SearchIcon } from './Icons';

interface DNASelectorProps {
    dnas: ScriptDNA[];
    selectedDNA: ScriptDNA | undefined;
    onSelect: (dna: ScriptDNA | undefined) => void;
}

export const DNASelector: React.FC<DNASelectorProps> = ({ dnas, selectedDNA, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDNAs = dnas.filter(dna =>
        dna.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dna.analysis?.tone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
                    Target DNA (Style)
                </h3>
                <button
                    onClick={() => onSelect(undefined)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-colors ${!selectedDNA ? 'bg-zinc-800 text-white border-zinc-600' : 'text-zinc-500 border-zinc-800 hover:text-white'}`}
                >
                    No DNA
                </button>
            </div>

            {dnas.length > 0 ? (
                <>
                    {/* Search Box */}
                    <div className="mb-3">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search DNA templates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-yellow-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* DNA Grid - 2x2 Compact Layout (2 rows max) */}
                    <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredDNAs.map(dna => (
                            <div
                                key={dna.id}
                                onClick={() => onSelect(dna)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all relative overflow-hidden group ${selectedDNA?.id === dna.id
                                    ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.1)]'
                                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/80'
                                    }`}
                            >
                                {/* Checkmark */}
                                <div className={`absolute top-2 right-2 transition-opacity ${selectedDNA?.id === dna.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <CheckIcon className={`w-4 h-4 ${selectedDNA?.id === dna.id ? 'text-yellow-400' : 'text-zinc-600'}`} />
                                </div>

                                {/* DNA Name */}
                                <h4 className={`font-bold text-sm mb-2 pr-6 line-clamp-1 ${selectedDNA?.id === dna.id ? 'text-yellow-400' : 'text-white'}`}>
                                    {dna.name}
                                </h4>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1 mb-1.5">
                                    <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded text-zinc-400 border border-white/5">
                                        {dna.analysis?.tone?.split(',')[0] || 'No Tone'}
                                    </span>
                                    {/* Niche Badge */}
                                    {dna.niche && (
                                        <span className="text-[9px] bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-400 border border-blue-500/20">
                                            {dna.niche}
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                <p className="text-[10px] text-zinc-500 line-clamp-2">
                                    {dna.analysis?.pacing || 'No pacing data'}
                                </p>
                            </div>
                        ))}
                    </div>

                    {filteredDNAs.length === 0 && (
                        <div className="p-6 border border-zinc-800 rounded-xl text-center bg-zinc-900/50">
                            <p className="text-zinc-500 text-sm">No DNAs match "{searchTerm}"</p>
                        </div>
                    )}
                </>
            ) : (
                <div className="p-8 border-2 border-dashed border-zinc-800 rounded-xl text-center bg-zinc-900/50">
                    <p className="text-zinc-500 text-sm">No DNA templates found. Go to DNA Lab to extract one.</p>
                </div>
            )}
        </section>
    );
};
