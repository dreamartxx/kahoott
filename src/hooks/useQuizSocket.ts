import { useState, useEffect, useRef, useCallback } from 'react';
import type { QuizPack, RoomState, Player, WSClientMessage, WSServerMessage } from '../types/quiz.js';
import { sounds } from '../utils/soundEffects.js';

export function useQuizSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [lastRoundResult, setLastRoundResult] = useState<{
    correctIndex: number;
    stats: { counts: number[]; totalAnswers: number };
    explanation?: string;
  } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const roleRef = useRef<'host' | 'player' | null>(null);

  // Initialize and maintain WebSocket connection
  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setErrorMessage(null);
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSServerMessage = JSON.parse(event.data);

        switch (msg.type) {
          case 'ROOM_CREATED':
            setRoom(msg.payload.room);
            roleRef.current = 'host';
            break;

          case 'JOIN_SUCCESS':
            setMyPlayerId(msg.payload.playerId);
            setRoom(msg.payload.room);
            roleRef.current = 'player';
            setErrorMessage(null);
            sounds.playPlayerJoin();
            break;

          case 'JOIN_ERROR':
            setErrorMessage(msg.payload.message);
            break;

          case 'ROOM_UPDATE':
            setRoom((prev) => {
              // Play join sound if a new player joined while in lobby
              if (prev && prev.status === 'LOBBY' && msg.payload.players.length > prev.players.length) {
                sounds.playPlayerJoin();
              }
              return msg.payload;
            });
            break;

          case 'COUNTDOWN':
            setCountdown(msg.payload.seconds);
            sounds.playTick(500 + (4 - msg.payload.seconds) * 150);
            break;

          case 'QUESTION_START':
            setCountdown(null);
            setHasAnswered(false);
            setSelectedAnswerIndex(null);
            setLastRoundResult(null);
            sounds.playTick(880);
            break;

          case 'PLAYER_ANSWER_RECEIVED':
            // Can be used to update live count
            break;

          case 'ROUND_REVEAL':
            setLastRoundResult({
              correctIndex: msg.payload.correctIndex,
              stats: msg.payload.stats,
              explanation: msg.payload.explanation,
            });
            break;

          case 'LEADERBOARD_UPDATE':
            break;

          case 'GAME_OVER':
            sounds.playPodiumFanfare();
            break;

          case 'ERROR':
            setErrorMessage(msg.payload.message);
            break;
        }
      } catch (err) {
        console.error('Error parsing WS message', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Auto-reconnect after 2 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 2000);
    };

    ws.onerror = () => {
      setIsConnected(false);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Send helper
  const send = useCallback((message: WSClientMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Action methods
  const createRoom = useCallback((quiz: QuizPack) => {
    send({
      type: 'HOST_CREATE_ROOM',
      payload: { quiz },
    });
  }, [send]);

  const joinRoom = useCallback((pin: string, nickname: string, avatar: string) => {
    send({
      type: 'PLAYER_JOIN',
      payload: { pin, nickname, avatar },
    });
  }, [send]);

  const startGame = useCallback((pin: string) => {
    send({
      type: 'HOST_START_GAME',
      payload: { pin },
    });
  }, [send]);

  const submitAnswer = useCallback((pin: string, playerId: string, answerIndex: number, timeElapsedMs: number) => {
    setHasAnswered(true);
    setSelectedAnswerIndex(answerIndex);
    sounds.playAnswerTap();
    send({
      type: 'PLAYER_SUBMIT_ANSWER',
      payload: { pin, playerId, answerIndex, timeElapsedMs },
    });
  }, [send]);

  const nextPhase = useCallback((pin: string) => {
    send({
      type: 'HOST_NEXT',
      payload: { pin },
    });
  }, [send]);

  const restartGame = useCallback((pin: string) => {
    send({
      type: 'HOST_RESTART',
      payload: { pin },
    });
  }, [send]);

  const kickPlayer = useCallback((pin: string, playerId: string) => {
    send({
      type: 'HOST_KICK',
      payload: { pin, playerId },
    });
  }, [send]);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const myPlayer: Player | undefined = room?.players.find((p) => p.id === myPlayerId);

  return {
    isConnected,
    room,
    myPlayerId,
    myPlayer,
    errorMessage,
    clearError,
    countdown,
    hasAnswered,
    selectedAnswerIndex,
    lastRoundResult,
    createRoom,
    joinRoom,
    startGame,
    submitAnswer,
    nextPhase,
    restartGame,
    kickPlayer,
  };
}
