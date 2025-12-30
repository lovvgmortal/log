import React, { useState } from 'react';
import { ScriptDNA, ContentPiece, OutputLanguage, UserSettings } from '../../types';
import { extractScriptDNA, refineScriptDNA } from '../../services/geminiService';
import { fetchYoutubeComments } from '../../services/youtubeService';
import { InputCard } from '../InputCard';
import { ConfirmDialog } from '../ConfirmDialog';
import { SpinnerIcon, SearchIcon, PlusIcon, DnaIcon, CheckIcon, TrashIcon, EditIcon, ArrowRightIcon, RefreshIcon, PenIcon, SparklesIcon, GridIcon, GlobeIcon } from '../Icons';
import { AI_MODELS } from '../../constants';
import { StructureEditor } from './StructureEditor';
import { Toast } from '../Toast';
import { detectScriptNiches, analyzeNicheCompatibility, NicheAnalysisResult } from '../../services/gemini/nicheDetection';
import { NicheWarningDialog } from './NicheWarningDialog';

interface DNAViewProps {
    savedDNAs: ScriptDNA[];
    onSaveDNA: (dna: ScriptDNA) => void;
    onDeleteDNA: (id: string) => void;
    onUpdateDNA: (dna: ScriptDNA) => void;
    userSettings: UserSettings | null;
}

const LANGUAGES: OutputLanguage[] = ['English', 'Vietnamese', 'Spanish', 'Japanese', 'Korean'];

export const DNAView: React.FC<DNAViewProps> = ({ savedDNAs, onSaveDNA, onDeleteDNA, onUpdateDNA, userSettings }) => {
    const [view, setView] = useState<'library' | 'extractor' | 'editor'>('library');
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeDNA, setActiveDNA] = useState<ScriptDNA | null>(null);
    const [parentDNA, setParentDNA] = useState<ScriptDNA | null>(null);

    const [virals, setVirals] = useState<ContentPiece[]>([]);
    const [flops, setFlops] = useState<ContentPiece[]>([]);
    const [language, setLanguage] = useState<OutputLanguage>('English');
    const [customPrompt, setCustomPrompt] = useState("");
    const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);

    // Confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; dnaId: string; dnaName: string }>({
        isOpen: false,
        dnaId: '',
        dnaName: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    // Niche Warning State
    const [nicheWarning, setNicheWarning] = useState<{
        isOpen: boolean;
        analysis: { majorityNiche: string; matchedIndices: number[]; mismatchedIndices: number[] };
        scriptDetails: NicheAnalysisResult[];
    }>({
        isOpen: false,
        analysis: { majorityNiche: '', matchedIndices: [], mismatchedIndices: [] },
        scriptDetails: []
    });

    // Batch Progress State (NEW)
    const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

    const handleAddPiece = (list: ContentPiece[], setList: React.Dispatch<React.SetStateAction<ContentPiece[]>>) => {
        setList([...list, { id: `ref-${Date.now()}`, title: '', description: '', script: '', comments: '' }]);
    };

    const handleUpdatePiece = (list: ContentPiece[], setList: React.Dispatch<React.SetStateAction<ContentPiece[]>>, id: string, field: keyof ContentPiece, value: string) => {
        setList(list.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleFetchComments = async (list: ContentPiece[], setList: React.Dispatch<React.SetStateAction<ContentPiece[]>>, id: string, url: string) => {
        if (!userSettings?.youtube_key) {
            alert("Please enter YouTube API Key in Settings.");
            return;
        }
        try {
            const comments = await fetchYoutubeComments(url, userSettings.youtube_key);
            handleUpdatePiece(list, setList, id, 'comments', comments);
        } catch (e: any) {
            // Error handling
        }
    };

    const handleExtractOrRefine = async () => {
        if (!userSettings?.openrouter_key) { alert("Please enter OpenRouter API Key in Settings."); return; }

        setIsProcessing(true);

        // --- PHASE 1: NICHE PRE-SCAN (For NEW Extractions Only) ---
        // Only run if we have > 1 viral script and it's a new extraction (not evolution)
        if (!parentDNA && virals.length > 1) {
            try {
                const nicheResults = await detectScriptNiches(virals, userSettings.openrouter_key, selectedModel);
                const analysis = analyzeNicheCompatibility(nicheResults);

                if (analysis.mismatchedIndices.length > 0) {
                    setIsProcessing(false); // Stop spinner
                    setNicheWarning({
                        isOpen: true,
                        analysis,
                        scriptDetails: nicheResults
                    });
                    return; // HALT here via return
                }
            } catch (e) {
                console.error("Pre-scan failed, continuing anyway:", e);
                // Continue if pre-scan fails (don't block user)
            }
        }

        // --- PHASE 2: EXECUTE EXTRACTION (If passed checks) ---
        await executeExtraction(virals, flops);
    };

    const executeExtraction = async (finalVirals: ContentPiece[], finalFlops: ContentPiece[]) => {
        setIsProcessing(true);
        setBatchProgress(null); // Reset progress

        try {
            let result: ScriptDNA;
            if (parentDNA) {
                result = await refineScriptDNA(parentDNA, finalVirals, finalFlops, language, userSettings?.openrouter_key || '', customPrompt, selectedModel);
            } else {
                // Pass progress callback to extractScriptDNA
                result = await extractScriptDNA(
                    finalVirals,
                    finalFlops,
                    language,
                    userSettings?.openrouter_key || '',
                    customPrompt,
                    selectedModel,
                    (current, total) => setBatchProgress({ current, total }) // Progress callback
                );
            }
            setActiveDNA(result);
            setView('editor');
        } catch (e: any) {
            alert("Failed to process DNA: " + e.message);
        } finally {
            setIsProcessing(false);
            setBatchProgress(null);
        }
    };

    // NEW: Create a blank DNA template manually
    const handleCreateManualDNA = () => {
        const blankDNA: ScriptDNA = {
            id: `dna-manual-${Date.now()}`,
            name: "New Manual Template",
            source_urls: [],
            user_notes: "",
            analysis: {
                tone: "",
                pacing: "",
                structure_skeleton: ["Hook", "Intro", "Body", "Payoff"],
                hook_angle: { type: "", description: "" },
                retention_tactics: [],
                audience_psychology: "",
                audience_sentiment: {
                    high_dopamine_triggers: [],
                    confusion_points: [],
                    objections: []
                },
                contrastive_insight: "",
                linguistic_fingerprint: { role_persona: "", tone_description: "", keywords: [], sentence_structure: "" },
                core_patterns: [],
                viral_x_factors: [],
                content_gaps: [],
                viral_triggers: [],
                flop_reasons: []
            },
            raw_transcript_summary: "Created manually."
        };
        setActiveDNA(blankDNA);
        setParentDNA(null);
        setView('editor');
    };

    const handleSaveEditor = () => { if (!activeDNA) return; const existing = (savedDNAs || []).find(d => d.id === activeDNA.id); if (existing) { onUpdateDNA(activeDNA); } else { onSaveDNA(activeDNA); } setView('library'); setActiveDNA(null); setParentDNA(null); setVirals([]); setFlops([]); setCustomPrompt(""); };
    const startEdit = (dna: ScriptDNA) => { setActiveDNA(dna); setParentDNA(null); setView('editor'); };
    const startEvolve = (dna: ScriptDNA) => { setParentDNA(dna); setVirals([]); setFlops([]); setCustomPrompt(""); setView('extractor'); }

    // --- IMPORT / EXPORT HANDLERS ---
    // Toast State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type });
    };

    const handleExportDNA = (dna: ScriptDNA) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dna, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${dna.name.replace(/\s+/g, '_')}_DNA.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showToast(`Exported "${dna.name}" successfully`, 'success');
    };

    const handleImportDNA = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileReader = new FileReader();
        if (e.target.files && e.target.files.length > 0) {
            fileReader.readAsText(e.target.files[0], "UTF-8");
            fileReader.onload = (event) => {
                try {
                    if (event.target?.result) {
                        const parsedDNA = JSON.parse(event.target.result as string);
                        // Basic validation: Check if it has an id and name (or at least looks like an object)
                        if (typeof parsedDNA === 'object' && parsedDNA.name) {
                            // Assign a new ID to avoid conflicts
                            const newDNA: ScriptDNA = {
                                ...parsedDNA,
                                id: `dna-import-${Date.now()}`,
                                name: `${parsedDNA.name} (Imported)`
                            };
                            onSaveDNA(newDNA);
                            showToast(`Successfully imported "${newDNA.name}"`, 'success');
                        } else {
                            showToast("Invalid DNA file format.", 'error');
                        }
                    }
                } catch (error) {
                    showToast("Error parsing JSON file.", 'error');
                }
            };
        }
    };

    // --- IMPROVED UI: Card-style List Editor with Textarea ---
    const ListEditor = ({ label, items, onChange, colorClass, placeholder }: { label: string, items: string[], onChange: (items: string[]) => void, colorClass: string, placeholder?: string }) => {
        const handleChange = (index: number, val: string) => {
            const newItems = [...items];
            newItems[index] = val;
            onChange(newItems);
        };
        const handleAdd = () => onChange([...items, ""]);
        const handleRemove = (index: number) => onChange(items.filter((_, i) => i !== index));

        // Extract bg color from text color class (naive mapping for UI glow)
        const bgColorClass = colorClass.replace('text-', 'bg-');

        return (
            <div className="bg-zinc-900/80 border border-white/5 rounded-3xl p-5 h-full flex flex-col group hover:border-white/10 transition-all shadow-xl backdrop-blur-sm relative overflow-hidden">
                {/* Ambient colored glow based on category color */}
                <div className={`absolute top-0 left-0 w-full h-1 opacity-50 ${bgColorClass}`}></div>

                <label className={`text-xs font-black uppercase tracking-widest mb-4 block ${colorClass} flex items-center gap-2`}>
                    <GridIcon className="w-4 h-4" /> {label}
                </label>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 max-h-[250px] lg:max-h-none">
                    {items.length === 0 && (
                        <div className="text-center py-8 opacity-30 text-xs italic">
                            No items yet. Add one below.
                        </div>
                    )}
                    {items.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-start group/item animate-in slide-in-from-bottom-2 duration-300">
                            <span className="text-[10px] font-mono text-zinc-600 w-4 text-right mt-3">{idx + 1}.</span>
                            <div className="flex-1 relative">
                                <textarea
                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all placeholder-zinc-700 shadow-inner min-h-[70px] resize-y leading-relaxed"
                                    value={item}
                                    onChange={(e) => handleChange(idx, e.target.value)}
                                    placeholder={placeholder || "Enter detail..."}
                                />
                                {/* Color dot indicator inside input */}
                                <div className={`absolute right-3 top-4 w-1.5 h-1.5 rounded-full opacity-0 group-focus-within/item:opacity-100 transition-opacity ${bgColorClass}`}></div>
                            </div>

                            <button
                                onClick={() => handleRemove(idx)}
                                className="p-2.5 mt-1 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover/item:opacity-100 scale-90 hover:scale-100"
                                title="Remove Item"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="pt-4 mt-2 border-t border-white/5">
                    <button onClick={handleAdd} className="w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-transparent hover:border-white/10 group/btn">
                        <div className={`p-0.5 rounded-full border border-zinc-600 group-hover/btn:border-white/50 transition-colors`}>
                            <div className={`p-0.5 rounded-full border border-zinc-600 group-hover/btn:border-white/50 transition-colors`}>
                                <PlusIcon className="w-3 h-3" />
                            </div>
                        </div>
                        Add {label.split(' ')[0]}
                    </button>
                </div>
            </div>
        );
    };

    if (view === 'library') {
        // Filter DNAs based on search
        const filteredDNAs = (savedDNAs || []).filter(dna =>
            dna.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dna.analysis?.tone?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                <div className="animate-in fade-in duration-500">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white">DNA Library</h2>
                            <p className="text-zinc-500 text-sm mt-1">Manage your extracted viral patterns</p>
                        </div>
                        <div className="flex gap-3">
                            <label className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer">
                                <ArrowRightIcon className="w-4 h-4 rotate-90" /> Import DNA
                                <input type="file" accept=".json" onChange={handleImportDNA} className="hidden" />
                            </label>
                            <button onClick={() => { setActiveDNA({ id: `dna-${Date.now()}`, name: '', source_urls: [], analysis: {}, raw_transcript_summary: '' }); setParentDNA(null); setView('editor'); }} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white hover:bg-zinc-700 transition-colors">
                                <PenIcon className="w-4 h-4" /> Manual Template
                            </button>
                            <button onClick={() => { setActiveDNA(null); setParentDNA(null); setVirals([]); setFlops([]); setView('extractor'); }} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-zinc-200 transition-colors">
                                <SparklesIcon className="w-4 h-4" /> AI Extraction
                            </button>
                        </div>
                    </div>

                    {/* Search Box */}
                    <div className="mb-6">
                        <div className="relative">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search DNA templates by name or tone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none transition-colors"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>

                    {filteredDNAs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {filteredDNAs.map((dna) => (
                                <div key={dna.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-600 transition-all group relative">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="w-8 h-8 bg-purple-500/10 rounded-md flex items-center justify-center">
                                            <DnaIcon className="w-4 h-4 text-purple-400" />
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleExportDNA(dna)} className="p-1 bg-zinc-800 hover:bg-blue-500/20 rounded text-zinc-400 hover:text-blue-400 transition-colors" title="Export JSON">
                                                <ArrowRightIcon className="w-3 h-3 rotate-[270deg]" />
                                            </button>
                                            <button onClick={() => { setActiveDNA(dna); setParentDNA(null); setView('editor'); }} className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-colors" title="Edit">
                                                <PenIcon className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => setConfirmDialog({ isOpen: true, dnaId: dna.id, dnaName: dna.name })} className="p-1 bg-zinc-800 hover:bg-red-500/20 rounded text-zinc-400 hover:text-red-400 transition-colors" title="Delete">
                                                <TrashIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-bold text-white mb-1.5 line-clamp-1">{dna.name}</h3>
                                    <div className="flex flex-wrap gap-1 mb-1.5">
                                        {dna.source_urls && dna.source_urls.length > 0 && (
                                            <span className="text-[8px] bg-black/40 px-1 py-0.5 rounded text-zinc-500 border border-white/5">~{dna.source_urls.length} Sources</span>
                                        )}
                                        {dna.analysis?.tone && (
                                            <span className="text-[8px] bg-purple-500/10 px-1 py-0.5 rounded text-purple-400 border border-purple-500/20">{dna.analysis.tone.split(',')[0]}</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-zinc-500 line-clamp-2 mb-2">{dna.analysis?.pacing || 'No pacing data'}</p>
                                    <button onClick={() => { setActiveDNA(null); setParentDNA(dna); setVirals([]); setFlops([]); setView('extractor'); }} className="w-full py-1 bg-zinc-800 hover:bg-purple-500/20 border border-zinc-700 hover:border-purple-500/50 rounded text-[9px] text-zinc-300 hover:text-purple-300 transition-all flex items-center justify-center gap-1">
                                        <RefreshIcon className="w-2.5 h-2.5" /> Evolve / Retrain
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : searchTerm ? (
                        <div className="text-center py-20">
                            <p className="text-zinc-500">No DNAs match "{searchTerm}"</p>
                            <button onClick={() => setSearchTerm('')} className="mt-3 text-purple-400 hover:text-purple-300 text-sm">Clear search</button>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-zinc-500">
                            <p className="text-lg mb-2">No DNA templates found.</p>
                            <p className="text-sm">Try adjusting your search or create a new template.</p>
                        </div>
                    )}
                </div>

                <ConfirmDialog
                    isOpen={confirmDialog.isOpen}
                    title="Delete DNA Template?"
                    message={`Are you sure you want to delete "${confirmDialog.dnaName}"? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    danger={true}
                    onConfirm={() => {
                        onDeleteDNA(confirmDialog.dnaId);
                        setConfirmDialog({ isOpen: false, dnaId: '', dnaName: '' });
                    }}
                    onCancel={() => setConfirmDialog({ isOpen: false, dnaId: '', dnaName: '' })}
                />
            </>
        );
    }

    if (view === 'extractor') {
        return (
            // UPDATE: max-w-6xl -> w-full
            <div className="w-full mx-auto pb-24 animate-in fade-in">
                <div className="flex items-center justify-between mb-8"><button onClick={() => setView('library')} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"><ArrowRightIcon className="w-4 h-4 rotate-180" /> Back to Library</button><div className="text-right"><h2 className="text-2xl font-bold text-white">{parentDNA ? 'Evolve Existing DNA' : 'New DNA Extraction'}</h2>{parentDNA && <p className="text-sm text-yellow-500 font-medium">Training Base: {parentDNA.name}</p>}</div></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div className="space-y-6"><div className="mb-4"><h3 className="text-lg font-bold text-green-400 flex items-center gap-2"><CheckIcon className="w-5 h-5" /> {parentDNA ? 'New Virals' : 'Virals'}</h3></div><div className="space-y-4">{virals.map((v, idx) => (<InputCard key={v.id} data={v} scriptNumber={idx + 1} onChange={(id, f, val) => handleUpdatePiece(virals, setVirals, id, f, val)} onRemove={() => setVirals(virals.filter(x => x.id !== v.id))} onFetchComments={(id, url) => handleFetchComments(virals, setVirals, id, url)} isRemovable showUrl showComments fieldLabels={{ script: "Transcript", comments: "Audience Comments" }} placeholders={{ script: "Paste content here..." }} />))}</div><button onClick={() => handleAddPiece(virals, setVirals)} className="w-full py-3 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 text-white font-medium transition-colors flex items-center justify-center gap-2"><PlusIcon className="w-4 h-4" />Add Viral</button></div>
                    <div className="space-y-6"><div className="mb-4"><h3 className="text-lg font-bold text-red-400 flex items-center gap-2"><TrashIcon className="w-5 h-5" /> {parentDNA ? 'New Flops' : 'Flops'}</h3></div><div className="space-y-4">{flops.map((v, idx) => (<InputCard key={v.id} data={v} scriptNumber={idx + 1} onChange={(id, f, val) => handleUpdatePiece(flops, setFlops, id, f, val)} onRemove={() => setFlops(flops.filter(x => x.id !== v.id))} onFetchComments={(id, url) => handleFetchComments(flops, setFlops, id, url)} isRemovable showUrl showComments fieldLabels={{ script: "Transcript", comments: "Audience Comments" }} placeholders={{ script: "Paste content here..." }} />))}</div><button onClick={() => handleAddPiece(flops, setFlops)} className="w-full py-3 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 text-white font-medium transition-colors flex items-center justify-center gap-2"><PlusIcon className="w-4 h-4" />Add Flop</button></div>
                </div>
                <div className="bg-zinc-900 sticky bottom-8 p-4 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col md:flex-row items-center justify-between z-50 gap-4">
                    <div className="flex-1 w-full md:w-auto relative group">
                        <PenIcon className="absolute top-3 left-3 w-4 h-4 text-zinc-500" />
                        <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="Override default analysis logic..." className="w-full bg-black border border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-300 focus:outline-none focus:border-yellow-500/50 min-h-[50px] resize-none leading-relaxed placeholder-zinc-600" />
                        <div className="absolute -top-3 left-3 px-1 bg-zinc-900 text-[9px] font-bold text-zinc-500 uppercase">Override Logic</div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase mb-1">AI Model</label>
                            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="bg-black border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 outline-none h-[42px] min-w-[180px]">
                                {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase mb-1">Language</label>
                            <select value={language} onChange={(e) => setLanguage(e.target.value as OutputLanguage)} className="bg-black border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 outline-none h-[42px]">
                                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>

                        {/* Batch Progress Indicator */}
                        {batchProgress && (
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] font-bold text-purple-400 uppercase mb-1">Processing</span>
                                <span className="text-white text-sm font-mono">Batch {batchProgress.current}/{batchProgress.total}</span>
                            </div>
                        )}

                        <button onClick={handleExtractOrRefine} disabled={isProcessing || virals.length === 0} className={`h-[42px] px-8 font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 mt-auto ${parentDNA ? 'bg-green-500 text-black hover:bg-green-400' : 'bg-white text-black hover:bg-yellow-400'}`}>
                            {isProcessing ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : (parentDNA ? <RefreshIcon className="w-5 h-5" /> : <DnaIcon className="w-5 h-5" />)}
                            {isProcessing && batchProgress ? `Batch ${batchProgress.current}/${batchProgress.total}` : (parentDNA ? "Run Evolution" : "Analyze & Extract DNA")}
                        </button>
                    </div>
                </div>

                <NicheWarningDialog
                    isOpen={nicheWarning.isOpen}
                    analysis={nicheWarning.analysis}
                    scriptDetails={nicheWarning.scriptDetails}
                    onContinueAll={() => {
                        setNicheWarning(prev => ({ ...prev, isOpen: false }));
                        executeExtraction(virals, flops);
                    }}
                    onUseMatchedOnly={() => {
                        setNicheWarning(prev => ({ ...prev, isOpen: false }));
                        // Filter virals to only matched indices
                        const matchedMap = new Set(nicheWarning.analysis.matchedIndices);
                        // Adjusted for 1-based index from analysis
                        const filteredVirals = virals.filter((_, idx) => matchedMap.has(idx + 1));

                        // Also optionally filter flops? Logic says "ignore flops that don't match viral niche".
                        // For now, let's pass filtered Virals.
                        executeExtraction(filteredVirals, flops);
                    }}
                    onCancel={() => {
                        setNicheWarning(prev => ({ ...prev, isOpen: false }));
                        setIsProcessing(false);
                    }}
                />
            </div>
        );
    }

    if (view === 'editor' && activeDNA) {
        const updateAnalysis = (field: keyof typeof activeDNA.analysis, value: any) => { setActiveDNA({ ...activeDNA, analysis: { ...activeDNA.analysis, [field]: value } }); };
        const updateSentiment = (field: 'high_dopamine_triggers' | 'confusion_points' | 'objections', value: any) => {
            setActiveDNA({ ...activeDNA, analysis: { ...activeDNA.analysis, audience_sentiment: { ...activeDNA.analysis.audience_sentiment, [field]: value } } });
        };

        const analysis = activeDNA.analysis || { structure_skeleton: [], viral_triggers: [], retention_tactics: [], flop_reasons: [], pacing: '', tone: '', audience_psychology: '', linguistic_style: '', hook_technique: '', audience_sentiment: { high_dopamine_triggers: [], confusion_points: [], objections: [] } };
        const sentiment = analysis.audience_sentiment || { high_dopamine_triggers: [], confusion_points: [], objections: [] };

        return (
            // UPDATE: max-w-7xl -> w-full
            <div className="w-full mx-auto pb-48 animate-in fade-in">
                <div className="flex items-center justify-between mb-8 sticky top-0 bg-black/80 backdrop-blur-md py-4 z-40 border-b border-white/5">
                    <button onClick={() => setView('library')} className="text-zinc-400 hover:text-white text-sm flex items-center gap-2"><ArrowRightIcon className="w-4 h-4 rotate-180" /> Cancel</button>
                    <input className="bg-transparent border-b border-zinc-700 text-2xl font-bold text-white text-center focus:border-yellow-500 focus:outline-none w-[300px]" value={activeDNA.name} onChange={(e) => setActiveDNA({ ...activeDNA, name: e.target.value })} placeholder="Untitled DNA" />
                    <button onClick={handleSaveEditor} className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-green-400 transition-colors shadow-lg shadow-white/10 flex items-center gap-2"><CheckIcon className="w-4 h-4" /> Save DNA</button>
                </div>

                {/* UPDATE: Optimized grid for XL screens (12 columns) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: DNA Core Specs (Narrower on XL screens) */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                        {/* User Constraints Input (NEW) */}
                        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-xl relative group">
                            <label className="text-[10px] font-bold text-yellow-400 uppercase mb-4 block flex items-center gap-2">
                                <PenIcon className="w-3 h-3" /> My Notes / Constraints
                            </label>
                            <textarea
                                className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm min-h-[120px] focus:outline-none focus:border-yellow-500 transition-all placeholder-zinc-600"
                                placeholder="Add your own mandatory elements or notes here (optional)..."
                                value={activeDNA.user_notes || ''}
                                onChange={(e) => setActiveDNA({ ...activeDNA, user_notes: e.target.value })}
                            />
                            <div className="absolute top-4 right-4 text-[9px] text-zinc-600 bg-black/50 px-2 py-1 rounded">Optional</div>
                        </div>

                        {/* Niche Input (NEW) */}
                        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-xl">
                            <label className="text-[10px] font-bold text-blue-400 uppercase mb-4 block flex items-center gap-2">
                                <GlobeIcon className="w-3 h-3" /> Niche / Category
                            </label>
                            <input
                                className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-all placeholder-zinc-600"
                                placeholder="e.g. Health & Fitness, Crypto, Gaming..."
                                value={activeDNA.niche || ''}
                                onChange={(e) => setActiveDNA({ ...activeDNA, niche: e.target.value })}
                            />
                        </div>

                        {/* Target Word Count Range (NEW) */}
                        <div className="bg-zinc-900 border border-green-500/30 rounded-2xl p-6 shadow-xl">
                            <label className="text-[10px] font-bold text-green-400 uppercase mb-4 block flex items-center gap-2">
                                📊 Target Word Count
                            </label>
                            <input
                                className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-500 transition-all placeholder-zinc-600"
                                placeholder="e.g. 3000-3400"
                                value={analysis.target_word_count_range || ''}
                                onChange={(e) => updateAnalysis('target_word_count_range', e.target.value)}
                            />
                            <p className="text-[9px] text-zinc-500 mt-2">Calculated from viral scripts. Scripts generated will aim for this range.</p>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase mb-4 block flex items-center gap-2"><SparklesIcon className="w-3 h-3 text-purple-400" /> Linguistic Fingerprint (The Voice)</label>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[9px] text-zinc-600 uppercase font-bold block mb-1">Persona / Role</span>
                                    <input className="w-full bg-black/40 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-300 text-xs focus:outline-none focus:border-purple-500/50"
                                        placeholder="e.g. The Rebel, The Wise Mentor"
                                        value={analysis.linguistic_fingerprint?.role_persona || ''}
                                        onChange={(e) => updateAnalysis('linguistic_fingerprint', { ...analysis.linguistic_fingerprint, role_persona: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <span className="text-[9px] text-zinc-600 uppercase font-bold block mb-1">Tone Analysis</span>
                                    <textarea className="w-full bg-black/40 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-300 text-xs min-h-[60px] focus:outline-none focus:border-purple-500/50"
                                        value={analysis.linguistic_fingerprint?.tone_description || ''}
                                        onChange={(e) => updateAnalysis('linguistic_fingerprint', { ...analysis.linguistic_fingerprint, tone_description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <span className="text-[9px] text-zinc-600 uppercase font-bold block mb-1">Signature Keywords</span>
                                    <input className="w-full bg-black/40 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-300 text-xs focus:outline-none focus:border-purple-500/50 font-mono"
                                        placeholder="Comma separated: e.g. Honestly, Listen..."
                                        value={(analysis.linguistic_fingerprint?.keywords || []).join(', ')}
                                        onChange={(e) => updateAnalysis('linguistic_fingerprint', { ...analysis.linguistic_fingerprint, keywords: e.target.value.split(',').map(s => s.trim()) })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase mb-4 block flex items-center gap-2"><CheckIcon className="w-3 h-3 text-blue-400" /> Hook Angle (Psychology)</label>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[9px] text-zinc-600 uppercase font-bold block mb-1">Angle / Category</span>
                                    <input className="w-full bg-black/40 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-300 text-xs focus:outline-none focus:border-blue-500/50"
                                        placeholder="e.g. Negative, Curiosity, Paradox..."
                                        value={analysis.hook_angle?.type || ''}
                                        onChange={(e) => updateAnalysis('hook_angle', { ...analysis.hook_angle, type: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <span className="text-[9px] text-zinc-600 uppercase font-bold block mb-1">Deconstruction</span>
                                    <textarea className="w-full bg-black/40 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-300 text-xs min-h-[80px] focus:outline-none focus:border-blue-500/50"
                                        placeholder="Explain WHY this hook works..."
                                        value={analysis.hook_angle?.description || ''}
                                        onChange={(e) => updateAnalysis('hook_angle', { ...analysis.hook_angle, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase mb-4 block flex items-center gap-2"><RefreshIcon className="w-3 h-3 text-yellow-400" /> Pacing & Tone</label>
                            <div className="space-y-4">
                                <div><span className="text-[9px] text-zinc-600 uppercase font-bold block mb-1">Pacing</span><textarea className="w-full bg-black/40 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-300 text-xs min-h-[60px] focus:outline-none focus:border-yellow-500/50" value={analysis.pacing} onChange={(e) => updateAnalysis('pacing', e.target.value)} /></div>
                                <div><span className="text-[9px] text-zinc-600 uppercase font-bold block mb-1">Tone</span><textarea className="w-full bg-black/40 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-300 text-xs min-h-[60px] focus:outline-none focus:border-yellow-500/50" value={analysis.tone} onChange={(e) => updateAnalysis('tone', e.target.value)} /></div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Deep Analysis (Wider on XL screens) */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-10"><SearchIcon className="w-24 h-24 text-white" /></div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase mb-3 block">Audience Psychology Overview</label>
                            <textarea className="w-full bg-transparent border-none text-white text-lg font-medium min-h-[80px] focus:outline-none placeholder-zinc-700 resize-none leading-relaxed" value={analysis.audience_psychology} onChange={(e) => updateAnalysis('audience_psychology', e.target.value)} />
                        </div>

                        {/* 1. Structural Skeleton (MAIN FEATURE - Full Width) */}
                        <div className="h-[auto] min-h-[500px]">
                            <StructureEditor items={analysis.structure_skeleton || []} onChange={(d) => updateAnalysis('structure_skeleton', d)} />
                        </div>

                        {/* 2. Audience Sentiment Breakdown (3 Cols) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:h-[300px]">
                            <ListEditor label="High Dopamine (Keep)" items={sentiment.high_dopamine_triggers || []} onChange={(d) => updateSentiment('high_dopamine_triggers', d)} colorClass="text-green-400" placeholder="e.g. 'Unexpected plot twist'" />
                            <ListEditor label="Confusion Points (Fix)" items={sentiment.confusion_points || []} onChange={(d) => updateSentiment('confusion_points', d)} colorClass="text-yellow-400" placeholder="e.g. 'Jargon used too early'" />
                            <ListEditor label="Objections (Address)" items={sentiment.objections || []} onChange={(d) => updateSentiment('objections', d)} colorClass="text-red-400" placeholder="e.g. 'Price is too high'" />
                        </div>

                        {/* 3. Secondary Tactics (3 Cols) */}
                        {/* 3. Pattern Recognition Engine (3 Cols) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:h-[300px]">
                            <ListEditor label="Core Patterns (70% Safe)" items={analysis.core_patterns || []} onChange={(d) => updateAnalysis('core_patterns', d)} colorClass="text-blue-400" placeholder="e.g. 'Standard 3-act structure'" />
                            <ListEditor label="Viral X-Factors (30% Magic)" items={analysis.viral_x_factors || []} onChange={(d) => updateAnalysis('viral_x_factors', d)} colorClass="text-purple-400" placeholder="e.g. 'Silent intro'" />
                            <ListEditor label="Flop Avoidance" items={analysis.flop_reasons || []} onChange={(d) => updateAnalysis('flop_reasons', d)} colorClass="text-red-400" placeholder="e.g. 'Slow Intro'" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
