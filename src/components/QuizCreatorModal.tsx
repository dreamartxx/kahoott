import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, Save, Sparkles, HelpCircle } from 'lucide-react';
import type { QuizPack, QuizQuestion } from '../types/quiz';
import { KAHOOT_THEMES } from '../utils/quizTheme';

interface QuizCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizCreated: (newQuiz: QuizPack) => void;
}

export const QuizCreatorModal: React.FC<QuizCreatorModalProps> = ({ isOpen, onClose, onQuizCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Genel Kültür');
  const [coverEmoji, setCoverEmoji] = useState('🎯');

  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q_' + Date.now() + '_1',
      question: '',
      timeLimit: 20,
      points: 1000,
      explanation: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    },
  ]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: 'q_' + Date.now() + '_' + (questions.length + 1),
        question: '',
        timeLimit: 20,
        points: 1000,
        explanation: '',
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx: number, val: string) => {
    const updated = [...questions];
    updated[idx].question = val;
    setQuestions(updated);
  };

  const handleExplanationChange = (idx: number, val: string) => {
    const updated = [...questions];
    updated[idx].explanation = val;
    setQuestions(updated);
  };

  const handleTimeLimitChange = (idx: number, val: number) => {
    const updated = [...questions];
    updated[idx].timeLimit = val;
    setQuestions(updated);
  };

  const handleOptionTextChange = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx].text = val;
    setQuestions(updated);
  };

  const handleSetCorrectOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options = updated[qIdx].options.map((opt, i) => ({
      ...opt,
      isCorrect: i === optIdx,
    }));
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Lütfen bir yarışma başlığı girin.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        alert(`${i + 1}. sorunun metnini yazmadınız.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          alert(`${i + 1}. sorunun ${j + 1}. seçeneği boş bırakılamaz.`);
          return;
        }
      }
      if (!q.options.some((opt) => opt.isCorrect)) {
        alert(`${i + 1}. soruda doğru cevabı işaretlemediniz.`);
        return;
      }
    }

    const newQuiz: QuizPack = {
      id: 'custom-' + Date.now(),
      title: title.trim(),
      description: description.trim() || 'Özel hazırlanmış yarışma paketi.',
      category: category.trim() || 'Özel',
      coverEmoji: coverEmoji || '🎯',
      questions,
    };

    try {
      await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuiz),
      });
    } catch {
      // fallback in memory
    }

    onQuizCreated(newQuiz);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-950 border border-purple-800/80 text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Yeni Bilgi Yarışması Oluştur</h2>
              <p className="text-xs text-slate-400">Kendi sorularınızı, süreleri ve seçenekleri belirleyin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Quiz Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Yarışma Başlığı *
              </label>
              <input
                type="text"
                placeholder="Örn: 90'lar Türkçe Pop Şarkıları"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Kategori
              </label>
              <input
                type="text"
                placeholder="Örn: Müzik, Sinema"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Kapak Emojisi
              </label>
              <input
                type="text"
                value={coverEmoji}
                onChange={(e) => setCoverEmoji(e.target.value)}
                maxLength={4}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-center text-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Açıklama (Opsiyonel)
              </label>
              <input
                type="text"
                placeholder="Yarışma hakkında kısa bir açıklama..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Sorular ({questions.length})</span>
              </h3>
              <button
                onClick={handleAddQuestion}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Soru Ekle</span>
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-4 relative"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-800 text-purple-300 font-mono font-bold flex items-center justify-center text-xs">
                      #{qIdx + 1}
                    </span>
                    <span className="font-bold text-white text-sm">Soru {qIdx + 1}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>Süre:</span>
                      <select
                        value={q.timeLimit}
                        onChange={(e) => handleTimeLimitChange(qIdx, Number(e.target.value))}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                      >
                        <option value={10}>10 sn</option>
                        <option value={15}>15 sn</option>
                        <option value={20}>20 sn</option>
                        <option value={30}>30 sn</option>
                      </select>
                    </div>

                    {questions.length > 1 && (
                      <button
                        onClick={() => handleRemoveQuestion(qIdx)}
                        title="Bu soruyu sil"
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <input
                  type="text"
                  placeholder="Soru metnini buraya yazın..."
                  value={q.question}
                  onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium text-sm focus:outline-none focus:border-purple-500"
                />

                {/* 4 Choices */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Seçenekler (Doğru cevabı yeşil tik ile işaretleyin)
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const theme = KAHOOT_THEMES[optIdx % KAHOOT_THEMES.length];
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 p-2 rounded-xl border ${
                            opt.isCorrect ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-700 bg-slate-900'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg ${theme.bgClass} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                          >
                            {theme.shapeChar}
                          </span>
                          <input
                            type="text"
                            placeholder={`${theme.name} seçenek...`}
                            value={opt.text}
                            onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                            className="flex-1 bg-transparent text-white text-xs focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSetCorrectOption(qIdx, optIdx)}
                            title={opt.isCorrect ? 'Doğru cevap seçildi' : 'Bunu doğru cevap yap'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              opt.isCorrect
                                ? 'bg-emerald-500 text-white'
                                : 'text-slate-600 hover:text-slate-300'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                <div className="pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Cevap Açıklaması / Biliyor muydunuz? (Opsiyonel):</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Cevap açıklandığında katılımcılara gösterilecek ilginç bilgi veya açıklama..."
                    value={q.explanation || ''}
                    onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Toplam {questions.length} soru hazır
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
            >
              Vazgeç
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Yarışmayı Kaydet & Oyna</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
