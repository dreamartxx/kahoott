import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { DEFAULT_QUIZZES } from './src/data/defaultQuizzes.js';
import type { QuizPack, RoomState, Player, GameStatus, QuizQuestion } from './src/types/quiz.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json());

// In-memory quizzes storage (seeded with defaults)
let quizzes: QuizPack[] = [...DEFAULT_QUIZZES];

interface PlayerInternal extends Player {
  ws?: WebSocket;
  currentAnswerIndex: number | null;
  timeElapsedMs: number;
}

interface RoomInternal {
  pin: string;
  title: string;
  quiz: QuizPack;
  hostWs: WebSocket;
  status: GameStatus;
  currentQuestionIndex: number;
  questionStartTime: number;
  questionDuration: number;
  timer: NodeJS.Timeout | null;
  players: Map<string, PlayerInternal>;
  answerStats: {
    counts: number[];
    totalAnswers: number;
  };
}

const rooms = new Map<string, RoomInternal>();

// Generate unique 6-digit room PIN
function generatePin(): string {
  let pin = '';
  for (let i = 0; i < 6; i++) {
    pin += Math.floor(Math.random() * 10).toString();
  }
  if (rooms.has(pin)) {
    return generatePin();
  }
  return pin;
}

// Convert internal room to public client state
function getRoomPublicState(room: RoomInternal): RoomState {
  const currentQ = room.quiz.questions[room.currentQuestionIndex] || null;
  const playerList: Player[] = Array.from(room.players.values()).map(p => ({
    id: p.id,
    nickname: p.nickname,
    avatar: p.avatar,
    score: p.score,
    streak: p.streak,
    lastAnswerIndex: p.lastAnswerIndex,
    lastAnswerCorrect: p.lastAnswerCorrect,
    lastPointsEarned: p.lastPointsEarned,
    connected: p.connected,
  })).sort((a, b) => b.score - a.score);

  // Assign ranks
  playerList.forEach((p, idx) => {
    p.rank = idx + 1;
  });

  const now = Date.now();
  let timeRemaining = room.questionDuration;
  if (room.status === 'QUESTION' && room.questionStartTime > 0) {
    const elapsed = Math.floor((now - room.questionStartTime) / 1000);
    timeRemaining = Math.max(0, room.questionDuration - elapsed);
  }

  return {
    pin: room.pin,
    title: room.title,
    quizId: room.quiz.id,
    hostId: 'host',
    status: room.status,
    currentQuestionIndex: room.currentQuestionIndex,
    totalQuestions: room.quiz.questions.length,
    currentQuestion: currentQ,
    timeRemaining,
    questionStartTime: room.questionStartTime,
    players: playerList,
    answerStats: room.answerStats,
  };
}

// Broadcast message to everyone in room
function broadcastToRoom(room: RoomInternal, message: object) {
  const data = JSON.stringify(message);
  if (room.hostWs.readyState === WebSocket.OPEN) {
    room.hostWs.send(data);
  }
  for (const player of room.players.values()) {
    if (player.ws && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(data);
    }
  }
}

// Broadcast room state update
function broadcastRoomUpdate(room: RoomInternal) {
  const state = getRoomPublicState(room);
  broadcastToRoom(room, {
    type: 'ROOM_UPDATE',
    payload: state,
  });
}

// Clean up room timers
function clearRoomTimer(room: RoomInternal) {
  if (room.timer) {
    clearTimeout(room.timer);
    room.timer = null;
  }
}

// End current question and calculate score
function endQuestionReveal(room: RoomInternal) {
  clearRoomTimer(room);
  room.status = 'REVEAL';

  const currentQ: QuizQuestion | undefined = room.quiz.questions[room.currentQuestionIndex];
  if (!currentQ) return;

  const correctIndex = currentQ.options.findIndex(opt => opt.isCorrect);

  // Calculate scores for players
  for (const player of room.players.values()) {
    if (player.currentAnswerIndex !== null) {
      const isCorrect = player.currentAnswerIndex === correctIndex;
      player.lastAnswerCorrect = isCorrect;
      player.lastAnswerIndex = player.currentAnswerIndex;

      if (isCorrect) {
        player.streak += 1;
        // Kahoot point formula: max 1000 points scaled by response speed
        const timeRatio = Math.min(1, Math.max(0, player.timeElapsedMs / (room.questionDuration * 1000)));
        const speedMultiplier = 1 - (timeRatio / 2); // 1.0 (fastest) down to 0.5 (at time limit)
        const streakBonus = Math.min(player.streak - 1, 5) * 50;
        const earned = Math.round((currentQ.points || 1000) * speedMultiplier) + streakBonus;
        player.score += earned;
        player.lastPointsEarned = earned;
      } else {
        player.streak = 0;
        player.lastPointsEarned = 0;
      }
    } else {
      player.lastAnswerCorrect = false;
      player.lastAnswerIndex = null;
      player.streak = 0;
      player.lastPointsEarned = 0;
    }
  }

  const state = getRoomPublicState(room);
  broadcastToRoom(room, {
    type: 'ROUND_REVEAL',
    payload: {
      correctIndex,
      stats: room.answerStats,
      players: state.players,
      explanation: currentQ.explanation,
    },
  });
  broadcastRoomUpdate(room);
}

// Start a question in room
function startQuestion(room: RoomInternal, questionIndex: number) {
  clearRoomTimer(room);
  room.currentQuestionIndex = questionIndex;
  const currentQ = room.quiz.questions[questionIndex];
  if (!currentQ) {
    // No more questions, show podium!
    room.status = 'PODIUM';
    broadcastRoomUpdate(room);
    return;
  }

  room.status = 'QUESTION';
  room.questionDuration = currentQ.timeLimit || 20;
  room.questionStartTime = Date.now();
  room.answerStats = {
    counts: new Array(currentQ.options.length).fill(0),
    totalAnswers: 0,
  };

  // Reset player question state
  for (const player of room.players.values()) {
    player.currentAnswerIndex = null;
    player.timeElapsedMs = 0;
    player.lastAnswerIndex = null;
    player.lastAnswerCorrect = null;
    player.lastPointsEarned = 0;
  }

  broadcastToRoom(room, {
    type: 'QUESTION_START',
    payload: {
      question: currentQ,
      questionIndex,
      total: room.quiz.questions.length,
      duration: room.questionDuration,
    },
  });
  broadcastRoomUpdate(room);

  // Set timeout to automatically end question
  room.timer = setTimeout(() => {
    endQuestionReveal(room);
  }, room.questionDuration * 1000);
}

// WebSocket Connection handling
wss.on('connection', (ws: WebSocket) => {
  let boundPin: string | null = null;
  let boundPlayerId: string | null = null;
  let isHost = false;

  ws.on('message', (rawData: string) => {
    try {
      const msg = JSON.parse(rawData);

      switch (msg.type) {
        case 'HOST_CREATE_ROOM': {
          const quizPayload: QuizPack = msg.payload?.quiz || DEFAULT_QUIZZES[0];
          const pin = generatePin();
          const newRoom: RoomInternal = {
            pin,
            title: quizPayload.title,
            quiz: quizPayload,
            hostWs: ws,
            status: 'LOBBY',
            currentQuestionIndex: -1,
            questionStartTime: 0,
            questionDuration: 20,
            timer: null,
            players: new Map(),
            answerStats: { counts: [0, 0, 0, 0], totalAnswers: 0 },
          };
          rooms.set(pin, newRoom);
          boundPin = pin;
          isHost = true;

          ws.send(JSON.stringify({
            type: 'ROOM_CREATED',
            payload: {
              pin,
              room: getRoomPublicState(newRoom),
            },
          }));
          break;
        }

        case 'PLAYER_JOIN': {
          const { pin, nickname, avatar } = msg.payload || {};
          const cleanPin = (pin || '').trim();
          const room = rooms.get(cleanPin);

          if (!room) {
            ws.send(JSON.stringify({
              type: 'JOIN_ERROR',
              payload: { message: 'Oda bulunamadı! Lütfen PIN kodunu kontrol edin.' },
            }));
            return;
          }

          if (room.status !== 'LOBBY') {
            ws.send(JSON.stringify({
              type: 'JOIN_ERROR',
              payload: { message: 'Bu yarışma zaten başladı! Sıradaki turu bekleyin.' },
            }));
            return;
          }

          // Check if nickname already exists in room
          const cleanNickname = (nickname || 'Oyuncu').trim().slice(0, 16);
          const existingSameName = Array.from(room.players.values()).find(
            p => p.nickname.toLowerCase() === cleanNickname.toLowerCase() && p.connected
          );
          if (existingSameName) {
            ws.send(JSON.stringify({
              type: 'JOIN_ERROR',
              payload: { message: 'Bu isim odada zaten kullanılıyor! Başka bir takma ad seçin.' },
            }));
            return;
          }

          const playerId = 'p_' + Math.random().toString(36).substring(2, 9);
          const newPlayer: PlayerInternal = {
            id: playerId,
            nickname: cleanNickname,
            avatar: avatar || '🦊',
            score: 0,
            streak: 0,
            connected: true,
            ws,
            currentAnswerIndex: null,
            timeElapsedMs: 0,
          };

          room.players.set(playerId, newPlayer);
          boundPin = cleanPin;
          boundPlayerId = playerId;
          isHost = false;

          ws.send(JSON.stringify({
            type: 'JOIN_SUCCESS',
            payload: {
              pin: cleanPin,
              playerId,
              room: getRoomPublicState(room),
            },
          }));

          broadcastRoomUpdate(room);
          break;
        }

        case 'HOST_START_GAME': {
          const { pin } = msg.payload || {};
          const room = rooms.get(pin || boundPin || '');
          if (!room || room.hostWs !== ws) return;

          room.status = 'STARTING';
          broadcastRoomUpdate(room);

          // 3 second countdown before first question
          let count = 3;
          broadcastToRoom(room, { type: 'COUNTDOWN', payload: { seconds: count } });
          const countdownInterval = setInterval(() => {
            count -= 1;
            if (count > 0) {
              broadcastToRoom(room, { type: 'COUNTDOWN', payload: { seconds: count } });
            } else {
              clearInterval(countdownInterval);
              startQuestion(room, 0);
            }
          }, 1000);
          break;
        }

        case 'PLAYER_SUBMIT_ANSWER': {
          const { pin, playerId, answerIndex, timeElapsedMs } = msg.payload || {};
          const room = rooms.get(pin || boundPin || '');
          if (!room || room.status !== 'QUESTION') return;

          const player = room.players.get(playerId || boundPlayerId || '');
          if (!player || player.currentAnswerIndex !== null) return; // already answered

          player.currentAnswerIndex = answerIndex;
          player.timeElapsedMs = timeElapsedMs || (Date.now() - room.questionStartTime);

          if (answerIndex >= 0 && answerIndex < room.answerStats.counts.length) {
            room.answerStats.counts[answerIndex] = (room.answerStats.counts[answerIndex] || 0) + 1;
            room.answerStats.totalAnswers += 1;
          }

          // Notify host of progress
          broadcastToRoom(room, {
            type: 'PLAYER_ANSWER_RECEIVED',
            payload: {
              playerId: player.id,
              totalAnswered: room.answerStats.totalAnswers,
              totalPlayers: Array.from(room.players.values()).filter(p => p.connected).length,
            },
          });

          // Check if all connected players have answered
          const connectedPlayers = Array.from(room.players.values()).filter(p => p.connected);
          const allAnswered = connectedPlayers.length > 0 && connectedPlayers.every(p => p.currentAnswerIndex !== null);
          if (allAnswered) {
            endQuestionReveal(room);
          }
          break;
        }

        case 'HOST_NEXT': {
          const { pin } = msg.payload || {};
          const room = rooms.get(pin || boundPin || '');
          if (!room || room.hostWs !== ws) return;

          if (room.status === 'QUESTION') {
            endQuestionReveal(room);
          } else if (room.status === 'REVEAL') {
            room.status = 'LEADERBOARD';
            const state = getRoomPublicState(room);
            broadcastToRoom(room, {
              type: 'LEADERBOARD_UPDATE',
              payload: {
                players: state.players,
                questionIndex: room.currentQuestionIndex,
                totalQuestions: room.quiz.questions.length,
              },
            });
            broadcastRoomUpdate(room);
          } else if (room.status === 'LEADERBOARD') {
            const nextIdx = room.currentQuestionIndex + 1;
            if (nextIdx < room.quiz.questions.length) {
              startQuestion(room, nextIdx);
            } else {
              room.status = 'PODIUM';
              const state = getRoomPublicState(room);
              broadcastToRoom(room, {
                type: 'GAME_OVER',
                payload: {
                  podium: state.players.slice(0, 3),
                  allPlayers: state.players,
                },
              });
              broadcastRoomUpdate(room);
            }
          }
          break;
        }

        case 'HOST_RESTART': {
          const { pin } = msg.payload || {};
          const room = rooms.get(pin || boundPin || '');
          if (!room || room.hostWs !== ws) return;

          clearRoomTimer(room);
          room.status = 'LOBBY';
          room.currentQuestionIndex = -1;
          for (const player of room.players.values()) {
            player.score = 0;
            player.streak = 0;
            player.currentAnswerIndex = null;
            player.lastAnswerIndex = null;
            player.lastAnswerCorrect = null;
            player.lastPointsEarned = 0;
          }
          broadcastRoomUpdate(room);
          break;
        }

        case 'HOST_KICK': {
          const { pin, playerId } = msg.payload || {};
          const room = rooms.get(pin || boundPin || '');
          if (!room || room.hostWs !== ws) return;

          const player = room.players.get(playerId);
          if (player) {
            if (player.ws && player.ws.readyState === WebSocket.OPEN) {
              player.ws.send(JSON.stringify({
                type: 'ERROR',
                payload: { message: 'Yarışma yöneticisi tarafından odadan çıkarıldınız.' },
              }));
              player.ws.close();
            }
            room.players.delete(playerId);
            broadcastRoomUpdate(room);
          }
          break;
        }
      }
    } catch (e) {
      console.error('Error handling WebSocket message:', e);
    }
  });

  ws.on('close', () => {
    if (boundPin) {
      const room = rooms.get(boundPin);
      if (room) {
        if (isHost) {
          // Host disconnected
          broadcastToRoom(room, {
            type: 'ERROR',
            payload: { message: 'Sunucu/Oda yöneticisi ayrıldı.' },
          });
          clearRoomTimer(room);
          rooms.delete(boundPin);
        } else if (boundPlayerId) {
          const player = room.players.get(boundPlayerId);
          if (player) {
            if (room.status === 'LOBBY') {
              room.players.delete(boundPlayerId);
            } else {
              player.connected = false;
            }
            broadcastRoomUpdate(room);
          }
        }
      }
    }
  });
});

// REST API Endpoints
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    activeRooms: rooms.size,
    timestamp: new Date().toISOString(),
    hostingerTarget: 'https://grey-cassowary-525647.hostingersite.com/',
  });
});

app.get('/api/quizzes', (_req, res) => {
  res.json(quizzes);
});

app.post('/api/quizzes', (req, res) => {
  try {
    const newQuiz: QuizPack = req.body;
    if (!newQuiz.title || !Array.isArray(newQuiz.questions) || newQuiz.questions.length === 0) {
      res.status(400).json({ error: 'Geçersiz yarışma formatı. Başlık ve sorular gereklidir.' });
      return;
    }
    newQuiz.id = newQuiz.id || 'custom-' + Date.now();
    quizzes.unshift(newQuiz);
    res.json({ success: true, quiz: newQuiz });
  } catch (err) {
    res.status(500).json({ error: 'Quiz kaydedilemedi.' });
  }
});

// Room status check
app.get('/api/rooms/:pin', (req, res) => {
  const pin = req.params.pin;
  const room = rooms.get(pin);
  if (!room) {
    res.status(404).json({ exists: false, error: 'Oda bulunamadı' });
    return;
  }
  res.json({
    exists: true,
    pin: room.pin,
    title: room.title,
    status: room.status,
    playerCount: room.players.size,
  });
});

// Hostinger Integration & SQL Export Endpoint
app.get('/api/export/sql', (_req, res) => {
  let sql = `-- KahootLive Veritabanı Yedek & Aktarım Dosyası
-- Hedef Hostinger Site: https://grey-cassowary-525647.hostingersite.com/
-- Tarih: ${new Date().toISOString()}

SET NAMES utf8mb4;
START TRANSACTION;

`;

  for (const q of quizzes) {
    const escapedTitle = q.title.replace(/'/g, "''");
    const escapedDesc = (q.description || '').replace(/'/g, "''");
    const escapedCat = (q.category || 'Genel').replace(/'/g, "''");
    const escapedEmoji = (q.coverEmoji || '🎮').replace(/'/g, "''");

    sql += `INSERT INTO \`quizzes\` (\`id\`, \`title\`, \`description\`, \`category\`, \`cover_emoji\`) 
VALUES ('${q.id}', '${escapedTitle}', '${escapedDesc}', '${escapedCat}', '${escapedEmoji}')
ON DUPLICATE KEY UPDATE \`title\` = '${escapedTitle}', \`description\` = '${escapedDesc}';\n\n`;

    q.questions.forEach((question, idx) => {
      const qText = question.question.replace(/'/g, "''");
      const optJson = JSON.stringify(question.options).replace(/'/g, "''");
      const explanation = (question.explanation || '').replace(/'/g, "''");
      sql += `INSERT INTO \`questions\` (\`id\`, \`quiz_id\`, \`question_text\`, \`time_limit\`, \`points\`, \`explanation\`, \`options_json\`, \`sort_order\`)
VALUES ('${question.id || 'q_' + idx}', '${q.id}', '${qText}', ${question.timeLimit || 20}, ${question.points || 1000}, '${explanation}', '${optJson}', ${idx})
ON DUPLICATE KEY UPDATE \`question_text\` = '${qText}';\n`;
    });
    sql += '\n';
  }

  sql += 'COMMIT;\n';

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="kahootlive-hostinger-export.sql"');
  res.send(sql);
});

// Setup Vite or Static Serving
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const fs = await import('fs');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.startsWith('/ws')) {
        return next();
      }
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`KahootLive Server is running on port ${PORT} (0.0.0.0)`);
  });
}

startServer();
