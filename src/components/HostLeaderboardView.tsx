import React, { useEffect } from 'react';
import { ArrowRight, Flame, Trophy, Award, Crown } from 'lucide-react';
import type { RoomState } from '../types/quiz';
import { sounds } from '../utils/soundEffects';

interface HostLeaderboardViewProps {
  room: RoomState;
  onNext: () => void;
}

export const HostLeaderboardView: React.FC<HostLeaderboardViewProps> = ({ room, onNext }) => {
  const isLastQuestion = room.currentQuestionIndex >= room.totalQuestions - 1;

  useEffect(() => {
    sounds.playTick(660);
  }, []);

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between p-4 md:p-8 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-950 border border-purple-800/60 text-purple-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Anlık Skor Tablosu</h2>
            <span className="text-xs text-slate-400 font-medium">
              Soru {room.currentQuestionIndex + 1} / {room.totalQuestions} Tamamlandı
            </span>
          </div>
        </div>

        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-all transform active:scale-95 cursor-pointer"
        >
          <span>{isLastQuestion ? 'Final Podyumunu Göster' : 'Sıradaki Soruya Geç'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Leaderboard List */}
      <div className="my-6 space-y-3">
        {room.players.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Oyuncu bulunamadı.</div>
        ) : (
          room.players.map((player, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;

            let rankBadge = (
              <span className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 font-mono font-bold flex items-center justify-center text-sm">
                #{idx + 1}
              </span>
            );

            if (isFirst) {
              rankBadge = (
                <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold flex items-center justify-center text-sm shadow-sm">
                  <Crown className="w-4 h-4 text-amber-400" />
                </span>
              );
            } else if (isSecond) {
              rankBadge = (
                <span className="w-8 h-8 rounded-lg bg-slate-300/20 text-slate-200 border border-slate-400/50 font-bold flex items-center justify-center text-sm shadow-sm">
                  <Award className="w-4 h-4 text-slate-300" />
                </span>
              );
            } else if (isThird) {
              rankBadge = (
                <span className="w-8 h-8 rounded-lg bg-amber-700/20 text-amber-400 border border-amber-700/50 font-bold flex items-center justify-center text-sm shadow-sm">
                  <Award className="w-4 h-4 text-amber-600" />
                </span>
              );
            }

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 transform ${
                  isFirst
                    ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/40 shadow-xl'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {rankBadge}
                  <span className="text-2xl select-none">{player.avatar}</span>
                  <div>
                    <span className="font-extrabold text-base md:text-lg text-white block leading-tight">
                      {player.nickname}
                    </span>
                    {player.streak > 1 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                        <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{player.streak} Soru Seri!</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  {player.lastPointsEarned !== undefined && player.lastPointsEarned > 0 && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md animate-bounce">
                      +{player.lastPointsEarned}
                    </span>
                  )}
                  <div>
                    <span className="text-xl md:text-2xl font-black font-mono text-white tabular-nums tracking-tight">
                      {player.score.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">
                      Puan
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="text-center text-xs text-slate-500 pb-2">
        KahootLive Skor Sistemi: Doğruluk + Cevaplama Hızı + Seri Bonusu
      </div>
    </div>
  );
};
