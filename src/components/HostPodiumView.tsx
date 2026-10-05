import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Crown, RotateCcw, Home, Sparkles, Award } from 'lucide-react';
import type { RoomState, Player } from '../types/quiz.js';
import { sounds } from '../utils/soundEffects.js';

interface HostPodiumViewProps {
  room: RoomState;
  onRestart: () => void;
  onBackToHome: () => void;
}

export const HostPodiumView: React.FC<HostPodiumViewProps> = ({ room, onRestart, onBackToHome }) => {
  const sortedPlayers: Player[] = [...room.players].sort((a, b) => b.score - a.score);
  const first = sortedPlayers[0];
  const second = sortedPlayers[1];
  const third = sortedPlayers[2];

  useEffect(() => {
    sounds.playPodiumFanfare();

    // Trigger celebration confetti
    try {
      const confettiFn = (confetti as unknown as { default?: typeof confetti }).default || confetti;
      if (typeof confettiFn === 'function') {
        const duration = 3.5 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
          confettiFn({
            particleCount: 4,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
          });
          confettiFn({
            particleCount: 4,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }
    } catch {
      // safe fallback
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center my-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-bold mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Yarışma Şampiyonları</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Podyum & Final Sonuçları
        </h1>
        <p className="text-slate-400 text-sm mt-1">{room.title}</p>
      </div>

      {/* 3-Step Podium Graphic */}
      <div className="my-8 flex items-end justify-center gap-3 md:gap-6 max-w-2xl mx-auto w-full px-4">
        {/* 2nd Place (Silver) */}
        <div className="flex-1 flex flex-col items-center">
          {second ? (
            <div className="flex flex-col items-center mb-2 animate-float">
              <span className="text-3xl md:text-4xl mb-1">{second.avatar}</span>
              <span className="font-extrabold text-sm md:text-base text-white truncate max-w-[100px] md:max-w-[130px]">
                {second.nickname}
              </span>
              <span className="text-xs font-mono font-bold text-slate-300">
                {second.score.toLocaleString()} P
              </span>
            </div>
          ) : (
            <div className="h-16 text-slate-600 text-xs flex items-center">-</div>
          )}
          <div className="w-full h-32 md:h-44 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-2xl border-t-2 border-slate-400 flex flex-col items-center justify-start pt-3 shadow-xl">
            <span className="text-2xl md:text-3xl font-black text-slate-300 font-mono">2</span>
            <Award className="w-5 h-5 text-slate-300 mt-1" />
          </div>
        </div>

        {/* 1st Place (Gold - Tallest) */}
        <div className="flex-1 flex flex-col items-center">
          {first ? (
            <div className="flex flex-col items-center mb-2 animate-float" style={{ animationDelay: '0.2s' }}>
              <Crown className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-md mb-1 animate-bounce" />
              <span className="text-4xl md:text-5xl mb-1">{first.avatar}</span>
              <span className="font-black text-base md:text-xl text-amber-300 truncate max-w-[110px] md:max-w-[160px]">
                {first.nickname}
              </span>
              <span className="text-xs md:text-sm font-mono font-black text-white">
                {first.score.toLocaleString()} Puan
              </span>
            </div>
          ) : (
            <div className="h-20 text-slate-600 text-xs flex items-center">-</div>
          )}
          <div className="w-full h-44 md:h-60 bg-gradient-to-t from-amber-900/90 to-amber-600 rounded-t-2xl border-t-4 border-amber-300 flex flex-col items-center justify-start pt-4 shadow-2xl relative">
            <div className="absolute inset-0 bg-amber-400/10 rounded-t-2xl pointer-events-none" />
            <span className="text-3xl md:text-4xl font-black text-white font-mono">1</span>
            <Trophy className="w-6 h-6 text-amber-200 mt-1" />
          </div>
        </div>

        {/* 3rd Place (Bronze) */}
        <div className="flex-1 flex flex-col items-center">
          {third ? (
            <div className="flex flex-col items-center mb-2 animate-float" style={{ animationDelay: '0.4s' }}>
              <span className="text-3xl md:text-4xl mb-1">{third.avatar}</span>
              <span className="font-extrabold text-sm md:text-base text-white truncate max-w-[100px] md:max-w-[130px]">
                {third.nickname}
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {third.score.toLocaleString()} P
              </span>
            </div>
          ) : (
            <div className="h-16 text-slate-600 text-xs flex items-center">-</div>
          )}
          <div className="w-full h-24 md:h-32 bg-gradient-to-t from-amber-950 to-amber-800 rounded-t-2xl border-t-2 border-amber-600 flex flex-col items-center justify-start pt-2 shadow-xl">
            <span className="text-2xl md:text-3xl font-black text-amber-200 font-mono">3</span>
            <Award className="w-5 h-5 text-amber-400 mt-1" />
          </div>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 my-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Tüm Katılımcı Sıralaması
        </h3>
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
          {sortedPlayers.map((player, idx) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 text-center font-mono font-bold text-slate-400 text-xs">
                  #{idx + 1}
                </span>
                <span className="text-xl">{player.avatar}</span>
                <span className="font-bold text-white">{player.nickname}</span>
              </div>
              <span className="font-mono font-bold text-slate-200">
                {player.score.toLocaleString()} P
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 py-4">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition-all transform active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Aynı Sorularla Tekrar Oyna</span>
        </button>

        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all transform active:scale-95 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Ana Sayfaya Dön</span>
        </button>
      </div>
    </div>
  );
};
