export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: [QuizOption, QuizOption, QuizOption, QuizOption] | QuizOption[];
  timeLimit: number; // in seconds (e.g. 20, 15, 30)
  points: number; // base points (e.g. 1000)
  category?: string;
  explanation?: string;
  imageUrl?: string;
}

export interface QuizPack {
  id: string;
  title: string;
  description: string;
  category: string;
  coverEmoji: string;
  questions: QuizQuestion[];
}

export interface Player {
  id: string;
  nickname: string;
  avatar: string;
  score: number;
  streak: number;
  rank?: number;
  lastAnswerIndex?: number | null;
  lastAnswerCorrect?: boolean | null;
  lastPointsEarned?: number;
  connected: boolean;
}

export type GameStatus = 'LOBBY' | 'STARTING' | 'QUESTION' | 'REVEAL' | 'LEADERBOARD' | 'PODIUM';

export interface RoomState {
  pin: string;
  title: string;
  quizId: string;
  hostId: string;
  status: GameStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentQuestion?: QuizQuestion | null;
  timeRemaining: number;
  questionStartTime: number;
  players: Player[];
  answerStats?: {
    counts: number[];
    totalAnswers: number;
  };
}

export type WSClientMessage =
  | { type: 'HOST_CREATE_ROOM'; payload: { quiz: QuizPack } }
  | { type: 'PLAYER_JOIN'; payload: { pin: string; nickname: string; avatar: string } }
  | { type: 'HOST_START_GAME'; payload: { pin: string } }
  | { type: 'PLAYER_SUBMIT_ANSWER'; payload: { pin: string; playerId: string; answerIndex: number; timeElapsedMs: number } }
  | { type: 'HOST_NEXT'; payload: { pin: string } }
  | { type: 'HOST_RESTART'; payload: { pin: string } }
  | { type: 'HOST_KICK'; payload: { pin: string; playerId: string } };

export type WSServerMessage =
  | { type: 'ROOM_CREATED'; payload: { pin: string; room: RoomState } }
  | { type: 'JOIN_SUCCESS'; payload: { pin: string; playerId: string; room: RoomState } }
  | { type: 'JOIN_ERROR'; payload: { message: string } }
  | { type: 'ROOM_UPDATE'; payload: RoomState }
  | { type: 'COUNTDOWN'; payload: { seconds: number } }
  | { type: 'QUESTION_START'; payload: { question: QuizQuestion; questionIndex: number; total: number; duration: number } }
  | { type: 'PLAYER_ANSWER_RECEIVED'; payload: { playerId: string; totalAnswered: number; totalPlayers: number } }
  | { type: 'ROUND_REVEAL'; payload: { correctIndex: number; stats: { counts: number[]; totalAnswers: number }; players: Player[]; explanation?: string } }
  | { type: 'LEADERBOARD_UPDATE'; payload: { players: Player[]; questionIndex: number; totalQuestions: number } }
  | { type: 'GAME_OVER'; payload: { podium: Player[]; allPlayers: Player[] } }
  | { type: 'ERROR'; payload: { message: string } };
