import React, { useEffect, useState } from 'react';
import { Timer, Users, FastForward, Award } from 'lucide-react';
import type { RoomState } from '../types/quiz.js';
import { KAHOOT_THEMES } from '../utils/quizTheme.js';

interface HostQuestionViewProps {
  room: RoomState;
  onSkipToEnd: () => void;
}

export const HostQuestionView: React.FC<HostQuestionViewProps> = ({ room, onSkipToEnd }) => {
  const currentQ = room.currentQuestion;
  const [secondsLeft, setSecondsLeft] = useState<number>(room.timeRemaining);

  useEffect(() => {
    setSecondsLeft(room.timeRemaining);
  }, [room.timeRemaining]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentQ) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400">
        Soru yükleniyor...
      </div>
    );
  }

  const answeredCount = room.answerStats?.totalAnswers || 0;
  const totalConnected = room.players.filter((p) => p.connected).length;
  const progressPercent = currentQ.timeLimit > 0 ? (secondsLeft / currentQ.timeLimit) * 100 : 0;

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between p-4 md:p-8 max-w-7xl mx-auto">
      {/* Top Info Bar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider font-extrabold px-3 py-1 bg-purple-950 text-purple-300 border border-purple-800/60 rounded-lg">
            Soru {room.currentQuestionIndex + 1} / {room.totalQuestions}
          </span>
          {currentQ.category && (
            <span className="text-sm font-semibold text-slate-300 hidden sm:inline">
              {currentQ.category}
            </span>
          )}
        </div>

        {/* Live Answer Submissions counter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-1.5 rounded-xl border border-slate-700/60">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-white tabular-nums">
              {answeredCount} / {totalConnected}
            </span>
            <span className="text-xs text-slate-400 hidden md:inline">Cevapladı</span>
          </div>

          <button
            onClick={onSkipToEnd}
            title="Süreyi bitir ve cevabı göster"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition-colors border border-slate-700 cursor-pointer"
          >
            <FastForward className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Süreyi Bitir</span>
          </button>
        </div>
      </div>

      {/* Center: Question Text & Timer Clock */}
      <div className="my-6 flex flex-col items-center justify-center">
        {/* Animated Countdown Circle / Badge */}
        <div className="relative mb-6 flex items-center justify-center">
          <div
            className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex flex-col items-center justify-center border-4 shadow-2xl transition-all duration-300 ${
              secondsLeft <= 5
                ? 'border-rose-500 bg-rose-950/60 text-rose-300 animate-pulse'
                : secondsLeft <= 10
                ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                : 'border-purple-500 bg-purple-950/40 text-purple-200'
            }`}
          >
            <Timer className="w-4 h-4 mb-0.5 opacity-70" />
            <span className="text-2xl md:text-3xl font-black tabular-nums tracking-tight">
              {secondsLeft}
            </span>
          </div>

          {/* Points badge */}
          <div className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-bold text-amber-400 flex items-center gap-1">
            <Award className="w-3 h-3" />
            <span>{currentQ.points} Puan</span>
          </div>
        </div>

        {/* Question Text Box */}
        <div className="w-full max-w-4xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-slate-800 rounded-3xl p-6 md:p-10 text-center shadow-2xl">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-snug tracking-tight text-balance">
            {currentQ.question}
          </h2>
        </div>

        {/* Linear progress bar */}
        <div className="w-full max-w-4xl mt-4 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-1000 ${
              secondsLeft <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-500 to-emerald-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Bottom: 4 Kahoot Answer Option Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl mx-auto">
        {currentQ.options.map((option, idx) => {
          const theme = KAHOOT_THEMES[idx % KAHOOT_THEMES.length];
          return (
            <div
              key={idx}
              className={`relative flex items-center gap-4 p-5 md:p-6 rounded-2xl ${theme.bgClass} text-white shadow-xl transition-transform duration-150 select-none`}
            >
              {/* Shape Icon */}
              <div className="w-12 h-12 rounded-xl bg-black/20 flex items-center justify-center shrink-0 text-2xl font-black drop-shadow">
                {theme.shapeChar}
              </div>

              {/* Text */}
              <div className="text-lg md:text-xl font-bold tracking-tight text-white leading-tight">
                {option.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
