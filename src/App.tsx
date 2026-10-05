/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useQuizSocket } from './hooks/useQuizSocket';
import { TopNav } from './components/TopNav';
import { HomeLobby } from './components/HomeLobby';
import { HostLobby } from './components/HostLobby';
import { HostQuestionView } from './components/HostQuestionView';
import { HostRevealView } from './components/HostRevealView';
import { HostLeaderboardView } from './components/HostLeaderboardView';
import { HostPodiumView } from './components/HostPodiumView';
import { PlayerView } from './components/PlayerView';
import { QuizCreatorModal } from './components/QuizCreatorModal';
import { HostingerDeployModal } from './components/HostingerDeployModal';
import { DEFAULT_QUIZZES } from './data/defaultQuizzes';
import type { QuizPack } from './types/quiz';

export default function App() {
  const {
    room,
    myPlayerId,
    myPlayer,
    errorMessage,
    clearError,
    countdown,
    hasAnswered,
    selectedAnswerIndex,
    createRoom,
    joinRoom,
    startGame,
    submitAnswer,
    nextPhase,
    restartGame,
    kickPlayer,
  } = useQuizSocket();

  const [quizzes, setQuizzes] = useState<QuizPack[]>(DEFAULT_QUIZZES);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [urlPin, setUrlPin] = useState<string>('');

  // Read ?pin= from URL if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pinParam = params.get('pin');
      if (pinParam) {
        setUrlPin(pinParam);
      }
    }
  }, []);

  // Fetch quizzes from server
  useEffect(() => {
    fetch('/api/quizzes')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setQuizzes(data);
        }
      })
      .catch(() => {
        // Fallback to default in-memory quizzes
      });
  }, []);

  const handleQuizCreated = (newQuiz: QuizPack) => {
    setQuizzes((prev) => [newQuiz, ...prev]);
  };

  const handleGoHome = () => {
    if (window.confirm('Ana sayfaya dönmek istediğinize emin misiniz?')) {
      window.location.href = '/';
    }
  };

  // Determine current screen
  const isHost = room && !myPlayerId;
  const isPlayer = room && !!myPlayerId && !!myPlayer;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Header */}
      <TopNav
        onOpenCreator={() => setIsCreatorOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onGoHome={handleGoHome}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* State 1: Home Lobby (No room joined yet) */}
        {!room && (
          <HomeLobby
            quizzes={quizzes}
            onHostCreate={(quiz) => createRoom(quiz)}
            onPlayerJoin={(pin, nickname, avatar) => joinRoom(pin, nickname, avatar)}
            onOpenCreator={() => setIsCreatorOpen(true)}
            onOpenDeployModal={() => setIsDeployModalOpen(true)}
            initialPin={urlPin}
            errorMessage={errorMessage}
            onClearError={clearError}
          />
        )}

        {/* State 2: Player Screen */}
        {isPlayer && (
          <PlayerView
            room={room}
            myPlayer={myPlayer}
            hasAnswered={hasAnswered}
            selectedAnswerIndex={selectedAnswerIndex}
            countdown={countdown}
            onSubmitAnswer={(answerIndex, timeElapsedMs) =>
              submitAnswer(room.pin, myPlayer.id, answerIndex, timeElapsedMs)
            }
          />
        )}

        {/* State 3: Host Views */}
        {isHost && (
          <>
            {room.status === 'LOBBY' && (
              <HostLobby
                room={room}
                onStartGame={() => startGame(room.pin)}
                onKickPlayer={(playerId) => kickPlayer(room.pin, playerId)}
              />
            )}

            {room.status === 'STARTING' && (
              <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
                <span className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-4">
                  YARIŞMA BAŞLIYOR
                </span>
                <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-400 font-mono animate-bounce">
                  {countdown || 3}
                </div>
                <p className="text-slate-300 text-lg font-semibold mt-6">
                  İlk soru yükleniyor...
                </p>
              </div>
            )}

            {room.status === 'QUESTION' && (
              <HostQuestionView
                room={room}
                onSkipToEnd={() => nextPhase(room.pin)}
              />
            )}

            {room.status === 'REVEAL' && (
              <HostRevealView
                room={room}
                onNext={() => nextPhase(room.pin)}
              />
            )}

            {room.status === 'LEADERBOARD' && (
              <HostLeaderboardView
                room={room}
                onNext={() => nextPhase(room.pin)}
              />
            )}

            {room.status === 'PODIUM' && (
              <HostPodiumView
                room={room}
                onRestart={() => restartGame(room.pin)}
                onBackToHome={handleGoHome}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <QuizCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onQuizCreated={handleQuizCreated}
      />

      <HostingerDeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />
    </div>
  );
}
