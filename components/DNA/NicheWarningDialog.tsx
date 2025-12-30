
import React from 'react';
import { NicheAnalysisResult } from '../../services/gemini/nicheDetection';

interface NicheWarningDialogProps {
    isOpen: boolean;
    analysis: {
        majorityNiche: string;
        matchedIndices: number[];
        mismatchedIndices: number[];
    };
    scriptDetails: NicheAnalysisResult[];
    onContinueAll: () => void;
    onUseMatchedOnly: () => void;
    onCancel: () => void;
}

export const NicheWarningDialog: React.FC<NicheWarningDialogProps> = ({
    isOpen,
    analysis,
    scriptDetails,
    onContinueAll,
    onUseMatchedOnly,
    onCancel
}) => {
    if (!isOpen) return null;

    const matchedScripts = scriptDetails.filter(s => analysis.matchedIndices.includes(s.scriptIndex));
    const mismatchedScripts = scriptDetails.filter(s => analysis.mismatchedIndices.includes(s.scriptIndex));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-yellow-500/30 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">Niche Mismatch Detected</h3>
                        <p className="text-sm text-zinc-400">
                            We detected different content niches in your selected viral scripts. For best DNA results, consistency is key.
                        </p>
                    </div>
                </div>

                {/* Analysis Breakdown */}
                <div className="bg-black/40 rounded-xl p-4 border border-zinc-800 space-y-4">

                    {/* Majority Group */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Majority Niche: {analysis.majorityNiche}</span>
                            <span className="text-xs text-zinc-500">{matchedScripts.length} scripts</span>
                        </div>
                        <div className="space-y-2">
                            {matchedScripts.map(s => (
                                <div key={s.scriptIndex} className="flex items-center gap-3 text-sm bg-green-500/5 p-2 rounded border border-green-500/10">
                                    <span className="font-mono font-bold text-green-500 w-6">#{s.scriptIndex}</span>
                                    <span className="text-zinc-200">{s.niche}</span>
                                    <span className="text-xs text-zinc-500 ml-auto border border-zinc-800 px-1.5 py-0.5 rounded">{s.tone}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mismatched Group */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Outliers / Different Niche</span>
                            <span className="text-xs text-zinc-500">{mismatchedScripts.length} scripts</span>
                        </div>
                        <div className="space-y-2">
                            {mismatchedScripts.map(s => (
                                <div key={s.scriptIndex} className="flex items-center gap-3 text-sm bg-yellow-500/5 p-2 rounded border border-yellow-500/10">
                                    <span className="font-mono font-bold text-yellow-500 w-6">#{s.scriptIndex}</span>
                                    <span className="text-zinc-200">{s.niche}</span>
                                    <span className="text-xs text-zinc-500 ml-auto border border-zinc-800 px-1.5 py-0.5 rounded">{s.tone}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={onContinueAll}
                        className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-sm transition-colors border border-zinc-700"
                    >
                        Continue with All
                    </button>
                    <button
                        onClick={onUseMatchedOnly}
                        className="py-3 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition-colors shadow-lg shadow-green-900/20"
                    >
                        Use Only #{analysis.matchedIndices.join(', #')}
                    </button>
                </div>

                <button
                    onClick={onCancel}
                    className="w-full text-center text-xs text-zinc-500 hover:text-zinc-400 mt-2"
                >
                    Cancel Analysis
                </button>
            </div>
        </div>
    );
};
