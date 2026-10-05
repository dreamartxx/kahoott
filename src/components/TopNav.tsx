import React from 'react';
import { Sparkles, Server, Plus, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../utils/soundEffects.js';

interface TopNavProps {
  onOpenCreator: () => void;
  onOpenDeployModal: () => void;
  onGoHome: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenCreator,
  onOpenDeployModal,
  onGoHome,
}) => {
  const [isMuted, setIsMuted] = React.useState(sounds.getMuted());

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
      {/* Zone 1: Single text element wordmark */}
      <button
        onClick={onGoHome}
        className="flex items-center gap-2 text-xl font-black tracking-tight text-white hover:text-purple-300 transition-colors cursor-pointer"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-display">KahootLive</span>
      </button>

      {/* Zone 2: Clean nav links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
        <button
          onClick={onGoHome}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Yarışma Lobisi
        </button>
        <button
          onClick={onOpenCreator}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Soru Editörü
        </button>
        <button
          onClick={onOpenDeployModal}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Hostinger & GitHub CI/CD
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={handleToggleSound}
          title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          )}
        </button>

        <button
          onClick={onOpenDeployModal}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-purple-300 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
        >
          <Server className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Hostinger Dağıtım</span>
        </button>

        <button
          onClick={onOpenCreator}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/25 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Yarışma Ekle</span>
        </button>
      </div>
    </header>
  );
};
