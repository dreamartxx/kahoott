import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, Users } from 'lucide-react';
import type { RoomState } from '../types/quiz.js';
import { KAHOOT_THEMES } from '../utils/quizTheme.js';
import { sounds } from '../utils/soundEffects.js';

interface HostRevealViewProps {
  room: RoomState;
  onNext: () => void;
}

export const HostRevealView: React.FC<HostRevealViewProps> = ({ room, onNext }) => {
  const currentQ = room.currentQuestion;
  const stats = room.answerStats || { counts: [0, 0, 0, 0], totalAnswers: 0 };
  const totalAnswers = stats.totalAnswers || 1; // avoid division by 0

  useEffect(() => {
    sounds.playCorrect();
  }, []);

  if (!currentQ) return null;

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between p-4 md:p-8 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider font-extrabold px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded-lg">
            Cevap Açıklandı!
          </span>
          <span className="text-sm font-semibold text-slate-300">
            Soru {room.currentQuestionIndex + 1} / {room.totalQuestions}
          </span>
        </div>

        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 transition-all transform active:scale-95 cursor-pointer"
        >
          <span>Skor Tablosuna Geç</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Center: Question and Explanation */}
      <div className="my-4 flex flex-col items-center">
        <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center shadow-xl mb-4">
          <h2 className="text-xl md:text-3xl font-extrabold text-white text-balance">
            {currentQ.question}
          </h2>
        </div>

        {/* Explanation Card */}
        {currentQ.explanation && (
          <div className="w-full max-w-3xl bg-purple-950/40 border border-purple-800/60 rounded-2xl p-4 text-purple-200 text-sm flex items-start gap-3 shadow-lg">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block mb-0.5">Biliyor muydunuz?</span>
              <p className="leading-relaxed">{currentQ.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom: 4 Options with Distribution Bars and Checkmarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl mx-auto">
        {currentQ.options.map((option, idx) => {
          const theme = KAHOOT_THEMES[idx % KAHOOT_THEMES.length];
          const count = stats.counts[idx] || 0;
          const percentage = Math.round((count / totalAnswers) * 100) || 0;
          const isCorrect = option.isCorrect;

          return (
            <div
              key={idx}
              className={`relative overflow-hidden flex flex-col justify-between p-5 rounded-2xl transition-all duration-300 ${
                isCorrect
                  ? `${theme.bgClass} ring-4 ring-emerald-400 shadow-2xl scale-[1.02]`
                  : `${theme.bgClass} opacity-40 grayscale-[40%]`
              }`}
            >
              {/* Background Distribution Bar */}
              <div
                className="absolute inset-0 bg-black/25 pointer-events-none transition-all duration-1000 origin-left"
                style={{ width: `${percentage}%` }}
              />

              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center shrink-0 text-xl font-black text-white">
                    {theme.shapeChar}
                  </div>
                  <span className="text-lg md:text-xl font-bold text-white leading-tight">
                    {option.text}
                  </span>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isCorrect ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-xl text-white font-extrabold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                      <span>DOĞRU</span>
                    </div>
                  ) : (
                    <XCircle className="w-6 h-6 text-white/50" />
                  )}
                </div>
              </div>

              {/* Vote Count indicator */}
              <div className="relative z-10 mt-3 pt-2 border-t border-white/20 flex items-center justify-between text-xs text-white/90 font-semibold">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span className="tabular-nums">{count} Oyuncu</span>
                </div>
                <span className="tabular-nums font-mono">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
