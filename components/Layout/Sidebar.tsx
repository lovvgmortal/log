
import React, { useEffect, useState } from 'react';
import { GridIcon, PenIcon, NoteIcon, DollarIcon, SparklesIcon, FacebookIcon, DnaIcon, ArrowRightIcon } from '../Icons';
import { fetchOpenRouterCredits } from '../../services/openRouterService';
import { CreditUsage, RoutePath, UserSettings } from '../../types';

interface SidebarProps {
  currentRoute: RoutePath;
  onNavigate: (path: RoutePath) => void;
  onLogout: () => void;
  userEmail?: string;
  openRouterKey?: string;
}

const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
  >
    {icon}
    {label}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate, onLogout, userEmail, openRouterKey }) => {
  const [credits, setCredits] = useState<CreditUsage | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isPricing = (currentRoute as string) === '/home/pricing';
  const scale = 5;
  const usageDisplay = credits ? (credits.usage || 0) * scale : 0;
  const limitDisplay = credits && credits.limit != null ? credits.limit * scale : null;
  const progressPercent = credits && credits.limit ? Math.min((credits.usage / credits.limit) * 100, 100) : 0;

  useEffect(() => {
    if (openRouterKey) {
      fetchOpenRouterCredits(openRouterKey).then(setCredits);
    }
  }, [openRouterKey]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-zinc-900 border border-white/10 rounded-lg hover:bg-zinc-800 transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 bottom-0 w-64 bg-zinc-950 border-r border-white/5 flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { onNavigate('/home/dashboard'); setIsOpen(false); }}>
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <PenIcon className="w-4 h-4 text-black" />
            </div>
            <span className="text-xl font-black text-white tracking-tighter">LOG</span>
          </div>
        </div>

        {!isPricing && (
          <>
            <nav className="flex-1 p-4 space-y-2">
              <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 mt-2">Menu</p>
              <SidebarItem icon={<GridIcon className="w-4 h-4" />} label="Dashboard" active={currentRoute === '/home/dashboard'} onClick={() => { onNavigate('/home/dashboard'); setIsOpen(false); }} />
              <SidebarItem icon={<PenIcon className="w-4 h-4" />} label="Creating" active={currentRoute === '/home/creating'} onClick={() => { onNavigate('/home/creating'); setIsOpen(false); }} />
              <SidebarItem icon={<DnaIcon className="w-4 h-4" />} label="DNA Lab" active={currentRoute === '/home/dna'} onClick={() => { onNavigate('/home/dna'); setIsOpen(false); }} />
              <SidebarItem icon={<NoteIcon className="w-4 h-4" />} label="Notes" active={currentRoute === '/home/notes'} onClick={() => { onNavigate('/home/notes'); setIsOpen(false); }} />

              <div className="pt-6 pb-2">
                <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">System</p>

                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <ArrowRightIcon className="w-4 h-4 rotate-180" />
                  Log Out
                </button>
              </div>
            </nav>

            <div className="px-4 pb-4 space-y-4">
              {/* Facebook Link */}
              <a
                href="https://www.facebook.com/logdd.pitre"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 hover:border-blue-500/40 rounded-lg text-sm font-bold text-blue-400 hover:text-blue-300 transition-all group"
              >
                <FacebookIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Support / Contact</span>
              </a>

              {credits && (
                <div className="bg-zinc-900/50 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">AI Usage</span>
                    <span className="text-xs font-mono font-bold text-white">${usageDisplay.toFixed(3)}</span>
                  </div>
                  {credits.limit && (
                    <div className="w-full h-1 bg-black rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  )}
                  {credits.limit && (
                    <div className="text-right text-[9px] text-zinc-600">
                      Limit: ${limitDisplay}
                    </div>
                  )}
                </div>
              )}

              {userEmail && (
                <div className="px-3 text-[10px] text-zinc-500 font-mono truncate opacity-60 hover:opacity-100 transition-opacity">
                  {userEmail}
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
};
