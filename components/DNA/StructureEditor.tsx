import React, { useState } from 'react';
import { DNASectionDetail } from '../../types';
import { PlusIcon, TrashIcon, GridIcon, ChevronDownIcon, ChevronUpIcon } from '../Icons';

interface StructureEditorProps {
    items: string[] | DNASectionDetail[];
    onChange: (items: string[] | DNASectionDetail[]) => void;
}

export const StructureEditor: React.FC<StructureEditorProps> = ({ items, onChange }) => {
    // CHANGE: Allow multiple expanded sections by storing an array of indices
    const [expandedIndices, setExpandedIndices] = useState<number[]>([0]);

    // Helper to detect type
    const isLegacy = items.length > 0 && typeof items[0] === 'string';

    const handleExpandToggle = (index: number) => {
        setExpandedIndices(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const handleAddSection = () => {
        if (isLegacy) {
            onChange([...(items as string[]), "New Section"]);
        } else {
            const newSection: DNASectionDetail = {
                section_name: "New Section",
                timing: "",
                word_count_range: "",
                tone: "",
                content_focus: ""
            };
            onChange([...(items as DNASectionDetail[]), newSection]);
            // Automatically expand the new section
            setExpandedIndices(prev => [...prev, items.length]);
        }
    };

    const handleRemoveSection = (index: number) => {
        if (isLegacy) {
            onChange((items as string[]).filter((_, i) => i !== index));
        } else {
            onChange((items as DNASectionDetail[]).filter((_, i) => i !== index));
        }
    };

    const handleUpdateLegacy = (index: number, val: string) => {
        const newItems = [...(items as string[])];
        newItems[index] = val;
        onChange(newItems);
    };

    const handleUpdateDetail = (index: number, field: keyof DNASectionDetail, val: any) => {
        const newItems = [...(items as DNASectionDetail[])];
        newItems[index] = { ...newItems[index], [field]: val };
        onChange(newItems);
    };

    // NEW: Move section up/down
    const handleMoveSection = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= items.length) return;

        if (isLegacy) {
            const newItems = [...(items as string[])];
            [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
            onChange(newItems);
        } else {
            const newItems = [...(items as DNASectionDetail[])];
            [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
            onChange(newItems);
        }
    };

    const convertToDetailed = () => {
        if (!isLegacy) return;
        const converted = (items as string[]).map(str => ({
            section_name: str,
            timing: "",
            word_count_range: "",
            tone: "",
            content_focus: ""
        }));
        onChange(converted);
    };

    // --- RENDER LEGACY VIEW ---
    if (isLegacy && items.length > 0) {
        return (
            <div className="bg-zinc-900/80 border border-white/5 rounded-3xl p-5 h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 opacity-50 bg-blue-400"></div>
                <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                        <GridIcon className="w-4 h-4" /> Structural Skeleton (Simple)
                    </label>
                    <button onClick={convertToDetailed} className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors">
                        Upgrade to Detailed Mode
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {(items as string[]).map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-start group/item">
                            <span className="text-[10px] font-mono text-zinc-600 w-4 text-right mt-3">{idx + 1}.</span>
                            <textarea
                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:outline-none focus:border-blue-500/50 min-h-[50px] resize-y"
                                value={item}
                                onChange={(e) => handleUpdateLegacy(idx, e.target.value)}
                            />
                            <button onClick={() => handleRemoveSection(idx)} className="p-2 opacity-0 group-hover/item:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="pt-4 mt-2 border-t border-white/5">
                    <button onClick={handleAddSection} className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-zinc-400 flex items-center justify-center gap-2">
                        <PlusIcon className="w-3 h-3" /> Add Section
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER DETAILED VIEW ---
    const detailedItems = items as DNASectionDetail[];

    // Calculate Total Estimated Word Count
    const totalWords = detailedItems.reduce((acc, item) => {
        if (!item.word_count_range) return acc;
        // Extract numbers from string like "50-100" or "approx 100"
        const matches = item.word_count_range.match(/(\d+)/g);
        if (matches) {
            // If range, take average. If single number, take it.
            const nums = matches.map(Number);
            const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
            return acc + avg;
        }
        return acc;
    }, 0);

    return (
        <div className="bg-zinc-900/80 border border-white/5 rounded-3xl p-5 h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 opacity-50 bg-blue-400"></div>
            <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-blue-400">
                    <GridIcon className="w-4 h-4" /> Structural Skeleton (Advanced)
                </label>
                <div className="text-[10px] font-mono text-zinc-500 bg-zinc-950/50 px-2 py-1 rounded border border-white/5">
                    Est. Total: <span className="text-zinc-200 font-bold">{Math.round(totalWords)} words</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {detailedItems.length === 0 && (
                    <div className="text-center py-8 opacity-30 text-xs italic">No sections yet.</div>
                )}

                {detailedItems.map((section, idx) => (
                    <div key={idx} className="bg-zinc-950/50 border border-zinc-800 rounded-xl overflow-hidden transition-all">
                        <div
                            className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => handleExpandToggle(idx)}
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <span className="text-[10px] font-mono text-zinc-600 w-4">{idx + 1}.</span>
                                <input
                                    className="bg-transparent text-sm font-bold text-zinc-200 focus:outline-none focus:text-blue-400 flex-1 min-w-0"
                                    value={section.section_name}
                                    onChange={(e) => { e.stopPropagation(); handleUpdateDetail(idx, 'section_name', e.target.value); }}
                                    placeholder="Section Name"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] text-zinc-500 bg-black/40 px-2 py-0.5 rounded border border-white/5 whitespace-nowrap">
                                    {section.word_count_range || "0 words"}
                                </span>
                                {/* Move Up/Down buttons */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, 'up'); }}
                                    disabled={idx === 0}
                                    className="text-zinc-600 hover:text-blue-400 p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move Up"
                                >
                                    <ChevronUpIcon className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, 'down'); }}
                                    disabled={idx === detailedItems.length - 1}
                                    className="text-zinc-600 hover:text-blue-400 p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Move Down"
                                >
                                    <ChevronDownIcon className="w-3 h-3" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleRemoveSection(idx); }} className="text-zinc-600 hover:text-red-400 p-1">
                                    <TrashIcon className="w-3 h-3" />
                                </button>
                                {expandedIndices.includes(idx) ? <ChevronUpIcon className="w-4 h-4 text-zinc-500" /> : <ChevronDownIcon className="w-4 h-4 text-zinc-500" />}
                            </div>
                        </div>

                        {/* Expanded Details Form */}
                        {expandedIndices.includes(idx) && (
                            <div className="p-4 border-t border-white/5 bg-black/20 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                <div>
                                    <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Target Word Count (Primary)</label>
                                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-bold focus:border-blue-500/50 outline-none"
                                        value={section.word_count_range || ''} onChange={(e) => handleUpdateDetail(idx, 'word_count_range', e.target.value)} placeholder="e.g. 40-60" />
                                </div>

                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Tone</label>
                                            <textarea className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:border-blue-500/50 outline-none min-h-[40px] resize-y"
                                                value={section.tone || ''} onChange={(e) => handleUpdateDetail(idx, 'tone', e.target.value)} placeholder="Urgent, Sarcastic..." />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Pacing</label>
                                            <textarea className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:border-blue-500/50 outline-none min-h-[40px] resize-y"
                                                value={section.pacing || ''} onChange={(e) => handleUpdateDetail(idx, 'pacing', e.target.value)} placeholder="Fast cuts, staccato..." />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Content Focus</label>
                                        <textarea className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:border-blue-500/50 outline-none min-h-[40px]"
                                            value={section.content_focus || ''} onChange={(e) => handleUpdateDetail(idx, 'content_focus', e.target.value)} placeholder="What happens here?" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Micro Hook (First 5s)</label>
                                            <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-yellow-300 focus:border-yellow-500/50 outline-none"
                                                value={section.micro_hook || ''} onChange={(e) => handleUpdateDetail(idx, 'micro_hook', e.target.value)} placeholder="Mini-hook strategy..." />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Open Loop (Optional)</label>
                                            <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-purple-300 focus:border-purple-500/50 outline-none"
                                                value={section.open_loop || ''} onChange={(e) => handleUpdateDetail(idx, 'open_loop', e.target.value)} placeholder="Curiosity gap..." />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Viral Trigger (Optional)</label>
                                            <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-green-300 focus:border-green-500/50 outline-none"
                                                value={section.viral_triggers || ''} onChange={(e) => handleUpdateDetail(idx, 'viral_triggers', e.target.value)} placeholder="Specific element..." />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Must Include Elements (Optional, comma-separated)</label>
                                        <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-orange-300 focus:border-orange-500/50 outline-none"
                                            value={Array.isArray(section.must_include) ? section.must_include.join(', ') : (section.must_include || '')}
                                            onChange={(e) => handleUpdateDetail(idx, 'must_include', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                            placeholder="e.g. Sound effect, Visual metaphor, Specific phrase" />
                                    </div>

                                    <div>
                                        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1 flex items-center gap-1">
                                            Audience Interaction / CTA (Optional)
                                        </label>
                                        <textarea className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-yellow-300 focus:border-yellow-500/50 outline-none min-h-[40px]"
                                            value={section.audience_interaction || ''}
                                            onChange={(e) => handleUpdateDetail(idx, 'audience_interaction', e.target.value)}
                                            placeholder="Specific CTA or engagement prompt (e.g. 'Comment YES below')"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1 flex items-center gap-1">
                                            Audience Value (Takeaway) <span className="text-red-400">*</span>
                                        </label>
                                        <textarea className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-blue-300 focus:border-blue-500/50 outline-none min-h-[40px]"
                                            value={section.audience_value || ''}
                                            onChange={(e) => handleUpdateDetail(idx, 'audience_value', e.target.value)}
                                            placeholder="What they learn, feel, or get..."
                                        />
                                    </div>
                                </>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="pt-4 mt-2 border-t border-white/5">
                <button onClick={handleAddSection} className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-zinc-400 flex items-center justify-center gap-2">
                    <PlusIcon className="w-3 h-3" /> Add Detailed Section
                </button>
            </div>
        </div >
    );
};
