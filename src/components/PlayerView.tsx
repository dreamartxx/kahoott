import React from 'react';
import { CheckCircle2, XCircle, Trophy, Sparkles, Clock, Flame, Award } from 'lucide-react';
import type { RoomState, Player } from '../types/quiz.js';
import { KAHOOT_THEMES } from '../utils/quizTheme.js';

interface PlayerViewProps {
  room: RoomState;
  myPlayer: Player;
  hasAnswered: boolean;
  selectedAnswerIndex: number | null;
  countdown: number | null;
  onSubmitAnswer: (answerIndex: number, timeElapsedMs: number) => void;
}

export const PlayerView: React.FC<PlayerViewProps> = ({
  room,
  myPlayer,
  hasAnswered,
  selectedAnswerIndex,
  countdown,
  onSubmitAnswer,
}) => {
  const currentQ = room.currentQuestion;

  const handleSelectAnswer = (idx: number) => {
    if (hasAnswered || room.status !== 'QUESTION') return;
    const elapsed = Date.now() - room.questionStartTime;
    onSubmitAnswer(idx, elapsed);
  };

  // 1. Lobby Waiting Screen
  if (room.status === 'LOBBY') {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-2xl text-6xl animate-float">
            {myPlayer.avatar}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight mb-1">
          {myPlayer.nickname}
        </h1>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Lobidesin, Hazırsın!</span>
        </div>

        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="text-slate-400 text-sm mb-2">Yarışma Başlığı</div>
          <div className="text-white font-bold text-base mb-4">{room.title}</div>
          <div className="flex items-center justify-center gap-2 text-xs text-purple-400 font-medium animate-pulse">
            <Clock className="w-4 h-4" />
            <span>Yönetici yarışmayı başlattığında ekranın güncellenecek</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Countdown Screen (3.. 2.. 1..)
  if (room.status === 'STARTING' || countdown !== null) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center">
        <span className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-4">
          YARIŞMA BAŞLIYOR
        </span>
        <div className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-400 font-mono animate-bounce">
          {countdown || 3}
        </div>
        <p className="text-slate-300 text-base font-semibold mt-6">
          Gözünü ekrandan ayırma!
        </p>
      </div>
    );
  }

  // 3. Question Active Screen: The 4 Big Kahoot Color Buttons!
  if (room.status === 'QUESTION') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 max-w-xl mx-auto">
        {/* Mobile Header */}
        <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{myPlayer.avatar}</span>
            <span className="font-bold text-sm text-white truncate max-w-[100px]">
              {myPlayer.nickname}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-amber-400">
              {myPlayer.score.toLocaleString()} P
            </span>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
              {room.currentQuestionIndex + 1}/{room.totalQuestions}
            </span>
          </div>
        </div>

        {/* If already answered, show confirmation screen */}
        {hasAnswered ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl my-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Cevap Gönderildi!</h2>
            <p className="text-slate-400 text-sm max-w-xs mb-6">
              Harika hız! Süre bittiğinde doğru cevap ve puan durumu ekrana gelecek.
            </p>

            {selectedAnswerIndex !== null && (
              <div
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-lg ${
                  KAHOOT_THEMES[selectedAnswerIndex % KAHOOT_THEMES.length].bgClass
                }`}
              >
                <span>Seçimin:</span>
                <span className="text-xl">
                  {KAHOOT_THEMES[selectedAnswerIndex % KAHOOT_THEMES.length].shapeChar}
                </span>
                <span>{KAHOOT_THEMES[selectedAnswerIndex % KAHOOT_THEMES.length].name}</span>
              </div>
            )}
          </div>
        ) : (
          /* The 4 Big Kahoot Shape Touch Buttons */
          <div className="flex-1 grid grid-cols-2 gap-3 md:gap-4 my-2">
            {(currentQ?.options || [{}, {}, {}, {}]).map((opt, idx) => {
              const theme = KAHOOT_THEMES[idx % KAHOOT_THEMES.length];
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl md:rounded-3xl ${theme.bgClass} ${theme.hoverClass} ${theme.activeClass} text-white shadow-2xl transform active:scale-95 transition-all duration-150 cursor-pointer select-none min-h-[140px]`}
                >
                  <span className="text-5xl md:text-6xl font-black drop-shadow mb-2 group-hover:scale-110 transition-transform">
                    {theme.shapeChar}
                  </span>
                  <span className="text-xs uppercase tracking-wider font-extrabold opacity-80">
                    {theme.name}
                  </span>
                  {/* If text fits, also show option text in small preview */}
                  {'text' in opt && opt.text && (
                    <span className="text-xs font-semibold mt-1 line-clamp-2 text-center text-white/90">
                      {opt.text}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="text-center text-[11px] text-slate-500 py-1">
          Hızlı cevap vermek daha çok puan kazandırır!
        </div>
      </div>
    );
  }

  // 4. Reveal Round Feedback Screen
  if (room.status === 'REVEAL') {
    const isCorrect = myPlayer.lastAnswerCorrect === true;
    const earned = myPlayer.lastPointsEarned || 0;

    return (
      <div
        className={`min-h-[85vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto rounded-3xl my-auto transition-colors duration-300 ${
          isCorrect ? 'bg-emerald-950/40 border-2 border-emerald-500/50' : 'bg-rose-950/40 border-2 border-rose-500/50'
        }`}
      >
        <div className="mb-4">
          {isCorrect ? (
            <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-rose-600 flex items-center justify-center shadow-2xl shadow-rose-600/40">
              <XCircle className="w-14 h-14 text-white" />
            </div>
          )}
        </div>

        <h2 className="text-3xl font-black text-white tracking-tight mb-1">
          {isCorrect ? 'DOĞRU CEVAP!' : 'YANLIŞ CEVAP!'}
        </h2>

        {isCorrect ? (
          <div className="my-4">
            <span className="text-3xl font-black font-mono text-emerald-400 block tabular-nums">
              +{earned} Puan
            </span>
            {myPlayer.streak > 1 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mt-2">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{myPlayer.streak} Soru Seri Bonusu!</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-300 text-sm my-4">
            Üzülme, sıradaki soruda farkı kapatabilirsin!
          </p>
        )}

        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-400">Toplam Skorun:</span>
          <span className="text-xl font-black font-mono text-white tabular-nums">
            {myPlayer.score.toLocaleString()} P
          </span>
        </div>
      </div>
    );
  }

  // 5. Leaderboard / Standings
  if (room.status === 'LEADERBOARD') {
    const rank = myPlayer.rank || 1;
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-purple-950 border border-purple-800/80 flex items-center justify-center text-4xl mb-4 shadow-xl">
          {myPlayer.avatar}
        </div>

        <span className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-1">
          Mevcut Sıralaman
        </span>
        <div className="text-5xl font-black text-white font-mono mb-2">
          #{rank}
        </div>
        <p className="text-slate-300 font-semibold text-sm mb-6">
          {rank === 1
            ? '🔥 Zirvedesin! Liderliği koru!'
            : rank <= 3
            ? '🥈 Podyumdasın! Harika gidiyorsun!'
            : 'Mücadeleye devam! İlk 3 hedefte.'}
        </p>

        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Toplam Puan:</span>
            <span className="font-mono font-black text-lg text-white">
              {myPlayer.score.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Soru Serisi:</span>
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Flame className="w-4 h-4 fill-amber-400" />
              {myPlayer.streak} Doğru
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 6. Final Podium Celebration Screen
  if (room.status === 'PODIUM') {
    const rank = myPlayer.rank || 1;
    const isTopThree = rank <= 3;

    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="mb-4">
          {rank === 1 ? (
            <div className="w-24 h-24 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-5xl animate-bounce">
              🏆
            </div>
          ) : isTopThree ? (
            <div className="w-24 h-24 rounded-full bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-5xl">
              🎖️
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-5xl">
              👏
            </div>
          )}
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight mb-1">
          Yarışma Tamamlandı!
        </h1>
        <p className="text-purple-300 font-bold text-base mb-6">
          {rank === 1
            ? 'TEBRİKLER! ŞAMPİYON OLDUN! 🥇'
            : isTopThree
            ? `TEBRİKLER! ${rank}. SIRADASIN! 🥈`
            : `Yarışmayı ${rank}. sırada tamamladın!`}
        </p>

        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl mb-4">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">
            Final Skorun
          </div>
          <div className="text-4xl font-black font-mono text-white tabular-nums mb-3">
            {myPlayer.score.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">
            Ana ekranda şampiyonluk podyumunu izleyin!
          </div>
        </div>
      </div>
    );
  }

  return null;
};
