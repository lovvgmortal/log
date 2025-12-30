
import React, { useState } from 'react';
import { ScriptSection, ScoringResult } from '../types';
import { SparklesIcon, RefreshIcon, CopyIcon, LayoutIcon, CheckIcon, ChevronDownIcon } from './Icons';

// Simple hash function that works with Vietnamese/Unicode text
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};


interface Props {
  section: ScriptSection;
  index: number;
  onUpdate: (id: string, newContent: string) => void;
  onRefine: (id: string, instruction: string) => Promise<void>;
  isProcessing: boolean;
}

export const ScriptSectionCard: React.FC<Props> = ({ section, index, onUpdate, onRefine, isProcessing }) => {
  const [prompt, setPrompt] = useState("");

  const handleRefineSubmit = async () => {
    if (!prompt.trim()) return;
    await onRefine(section.id, prompt);
    setPrompt("");
  };

  const handleAutoRefine = async () => {
    await onRefine(section.id, "Improve this section to be more engaging and punchy.");
  };

  // Calculate word count
  const getWordCount = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  };

  const wordCount = getWordCount(section.content);
  const score = section.scoringResult?.total_score;
  const scoreColor = score ? (score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400') : 'text-zinc-500';

  return (
    <div className="group relative pl-10 pb-10 last:pb-0">
      {/* Connector Line */}
      <div className="absolute left-[15px] top-8 bottom-0 w-[1px] bg-gradient-to-b from-zinc-800 to-transparent last:hidden group-last:hidden"></div>

      {/* Node Dot */}
      <div className={`absolute left-0 top-8 w-8 h-8 rounded-full border flex items-center justify-center z-10 shadow-lg shadow-black/50 transition-colors ${score ? (score >= 80 ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-yellow-500/10 border-yellow-500 text-yellow-400') : 'bg-zinc-900 border-zinc-700 text-zinc-400'}`}>
        <span className="text-[10px] font-mono font-bold">{index + 1}</span>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-xl hover:shadow-black/20">
        {/* Header */}
        <div className="bg-white/5 border-b border-white/5 px-5 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-widest shadow-sm shadow-blue-900/20">
              {section.type}
            </span>
            <h4 className="text-sm font-semibold text-zinc-200 tracking-tight">{section.title}</h4>
          </div>
          <div className="flex items-center gap-4">
            {score !== undefined && (
              <div className={`text-xs font-black ${scoreColor}`}>
                {score}/100
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded border border-white/5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Words:</span>
              <span className="text-[10px] font-mono font-bold text-white">{wordCount}</span>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => navigator.clipboard.writeText(section.content)}
                className="p-1.5 hover:bg-white/10 rounded-md text-zinc-500 hover:text-white transition-colors"
                title="Copy Section"
              >
                <CopyIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-1">
          <textarea
            value={section.content}
            onChange={(e) => onUpdate(section.id, e.target.value)}
            className="w-full bg-transparent text-zinc-300 resize-y focus:outline-none min-h-[120px] leading-relaxed p-4 text-sm font-light selection:bg-blue-500/30"
            spellCheck={false}
          />
        </div>

        {/* Magic Bar */}
        <div className="px-4 py-3 bg-zinc-950/30 border-t border-white/5 flex items-center gap-3">
          <div className="flex-1 relative group/input">
            <input
              type="text"
              placeholder="AI Edit: e.g. 'Make it funnier' or 'Shorter'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRefineSubmit()}
              disabled={isProcessing}
              className="w-full bg-black/50 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-300 focus:outline-none focus:border-purple-500/50 focus:bg-black/70 transition-all placeholder-zinc-600 group-hover/input:border-zinc-600"
            />
            <SparklesIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 group-hover/input:text-purple-400 transition-colors" />
          </div>

          <button
            onClick={handleRefineSubmit}
            disabled={isProcessing || !prompt.trim()}
            className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? '...' : 'Run'}
          </button>

          <button
            onClick={handleAutoRefine}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-transparent hover:bg-white/5 text-xs font-medium text-zinc-500 hover:text-green-400 transition-colors whitespace-nowrap"
            title="Auto Improve"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
