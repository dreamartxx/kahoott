import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Plus, ArrowRight, Server, Globe, Users, Trophy } from 'lucide-react';
import type { QuizPack } from '../types/quiz';
import { FUN_AVATARS } from '../utils/quizTheme';

interface HomeLobbyProps {
  quizzes: QuizPack[];
  onHostCreate: (quiz: QuizPack) => void;
  onPlayerJoin: (pin: string, nickname: string, avatar: string) => void;
  onOpenCreator: () => void;
  onOpenDeployModal: () => void;
  initialPin?: string;
  errorMessage?: string | null;
  onClearError?: () => void;
}

export const HomeLobby: React.FC<HomeLobbyProps> = ({
  quizzes,
  onHostCreate,
  onPlayerJoin,
  onOpenCreator,
  onOpenDeployModal,
  initialPin = '',
  errorMessage,
  onClearError,
}) => {
  const [pin, setPin] = useState(initialPin);
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(FUN_AVATARS[0]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>(quizzes[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'join' | 'host'>(initialPin ? 'join' : 'join');

  useEffect(() => {
    if (initialPin) {
      setPin(initialPin);
      setActiveTab('join');
    }
  }, [initialPin]);

  useEffect(() => {
    if (quizzes.length > 0 && !selectedQuizId) {
      setSelectedQuizId(quizzes[0].id);
    }
  }, [quizzes, selectedQuizId]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      alert('Lütfen geçerli bir PIN kodu girin.');
      return;
    }
    if (!nickname.trim()) {
      alert('Lütfen bir takma ad (nickname) belirleyin.');
      return;
    }
    onPlayerJoin(pin.trim(), nickname.trim(), selectedAvatar);
  };

  const handleHostStart = () => {
    const chosenQuiz = quizzes.find((q) => q.id === selectedQuizId) || quizzes[0];
    if (chosenQuiz) {
      onHostCreate(chosenQuiz);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Hero Welcome */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-bold mb-4">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Gerçek Zamanlı Çok Oyunculu Bilgi Yarışması</span>
        </div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight text-balance">
          Canlı Kahoot Tarzı Yarışma Platformu
        </h1>
        <p className="mt-3 text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          QR kodla anında katılın, büyük ekranda yarışın, hız ve bilginizle anlık skor tablosunda zirveye tırmanın!
        </p>

        {/* Hostinger & GitHub banner */}
        <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={onOpenDeployModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Server className="w-4 h-4 text-purple-400" />
            <span>Hostinger Business & GitHub Actions Entegrasyonu</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-200">
              Hazır
            </span>
          </button>
        </div>
      </div>

      {/* Main Tab Toggle: Katıl (Player) vs Oda Aç (Host) */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
          <button
            onClick={() => {
              setActiveTab('join');
              if (onClearError) onClearError();
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'join'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Yarışmaya Katıl</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('host');
              if (onClearError) onClearError();
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'host'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Yarışma Yönet (Host)</span>
          </button>
        </div>
      </div>

      {/* Error Message Toast */}
      {errorMessage && (
        <div className="max-w-md mx-auto mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-sm flex items-center justify-between shadow-xl">
          <span>{errorMessage}</span>
          {onClearError && (
            <button
              onClick={onClearError}
              className="text-xs text-rose-400 hover:text-rose-100 font-bold ml-3"
            >
              Kapat
            </button>
          )}
        </div>
      )}

      {/* Mode 1: Join Game (Player) */}
      {activeTab === 'join' && (
        <div className="max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative">
          <form onSubmit={handleJoinSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Oyun PIN Kodu *
              </label>
              <input
                type="text"
                maxLength={8}
                placeholder="Örn: 847291"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\s+/g, ''))}
                className="w-full px-4 py-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-white font-mono text-xl tracking-widest text-center focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block text-center">
                Ana ekranda veya sunucuda görünen 6 haneli PIN kodu
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Takma Adın (Nickname) *
              </label>
              <input
                type="text"
                maxLength={16}
                placeholder="Örn: EfsaneYarışmacı"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-white text-base font-bold focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Karakter Emojini Seç
              </label>
              <div className="grid grid-cols-8 gap-1.5 p-2 bg-slate-950 border border-slate-800 rounded-2xl">
                {FUN_AVATARS.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`h-10 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                      selectedAvatar === emoji
                        ? 'bg-purple-600 scale-110 shadow-md ring-2 ring-purple-400'
                        : 'hover:bg-slate-800'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-base shadow-xl shadow-emerald-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Yarışmaya Katıl</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* Mode 2: Host Game (Select Quiz & Launch) */}
      {activeTab === 'host' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Yarışma Paketi Seçin
              </h2>
              <p className="text-xs text-slate-400">
                Önceden hazırlanmış paketlerden birini seçin veya kendiniz yeni bir yarışma oluşturun.
              </p>
            </div>

            <button
              onClick={onOpenCreator}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Bilgi Yarışması Oluştur</span>
            </button>
          </div>

          {/* Quiz Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {quizzes.map((quiz) => {
              const isSelected = selectedQuizId === quiz.id;
              return (
                <div
                  key={quiz.id}
                  onClick={() => setSelectedQuizId(quiz.id)}
                  className={`relative cursor-pointer p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-900 border-purple-500 shadow-2xl ring-2 ring-purple-500/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-4xl">{quiz.coverEmoji || '🎮'}</span>
                      <span className="text-xs font-bold text-purple-300 bg-purple-950 px-2.5 py-1 rounded-lg border border-purple-800/60">
                        {quiz.questions.length} Soru
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white leading-snug mb-2">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {quiz.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{quiz.category}</span>
                    <span
                      className={`font-bold ${
                        isSelected ? 'text-purple-400' : 'text-slate-500'
                      }`}
                    >
                      {isSelected ? 'Seçildi ✓' : 'Seçmek İçin Tıkla'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Start Hosting Button */}
          <div className="flex flex-col items-center justify-center pt-4">
            <button
              onClick={handleHostStart}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white text-base md:text-lg font-black shadow-xl shadow-purple-600/30 transition-all transform active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Bu Yarışmayı Başlat (Oda Aç & PIN Al)</span>
            </button>
            <span className="text-xs text-slate-500 mt-2">
              Büyük ekran sunum modu, QR kod ve canlı katılımcı lobisi açılacaktır
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
