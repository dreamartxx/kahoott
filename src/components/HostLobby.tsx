import React, { useState } from 'react';
import { Copy, Check, Play, Users, QrCode, Sparkles, X, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { QRCodeDisplay } from './QRCodeDisplay';
import type { RoomState } from '../types/quiz';
import { sounds } from '../utils/soundEffects';

interface HostLobbyProps {
  room: RoomState;
  onStartGame: () => void;
  onKickPlayer: (playerId: string) => void;
}

export const HostLobby: React.FC<HostLobbyProps> = ({ room, onStartGame, onKickPlayer }) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const joinUrl = `${currentUrl}?pin=${room.pin}`;

  const copyPin = () => {
    navigator.clipboard.writeText(room.pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyJoinLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 md:p-8 overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />

      {/* Top Bar for Host Screen */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 md:px-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-purple-400">Yarışma Başlığı</span>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">{room.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
          <button
            onClick={toggleFullscreen}
            title="Tam Ekran"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          <button
            onClick={onStartGame}
            disabled={room.players.length === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base shadow-lg transition-all transform active:scale-95 ${
              room.players.length > 0
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/25 cursor-pointer animate-pulse-slow'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Yarışmayı Başlat {room.players.length > 0 && `(${room.players.length})`}</span>
          </button>
        </div>
      </div>

      {/* Main Center Area: PIN, QR & Instructions */}
      <div className="relative z-10 my-6 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        {/* Left: QR Code Card */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">
            <QrCode className="w-4 h-4" />
            <span>Hızlı Katılım</span>
          </div>

          <QRCodeDisplay value={joinUrl} size={190} />

          <p className="mt-4 text-sm text-slate-300 font-medium">
            Telefonunuzun kamerasıyla QR kodu okutun ve anında katılın!
          </p>

          <button
            onClick={copyJoinLink}
            className="mt-3 text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Kopyalandı!' : 'Katılım Linkini Kopyala'}</span>
          </button>
        </div>

        {/* Right: Big Game PIN Display */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-800/50 text-purple-300 text-sm font-semibold mb-3">
            <Sparkles className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Giriş Yapmak İçin PIN Kodunu Kullanın</span>
          </div>

          <div
            onClick={copyPin}
            className="group relative cursor-pointer bg-gradient-to-br from-slate-900 via-purple-950/50 to-slate-900 border-2 border-purple-500/40 hover:border-purple-400 p-6 md:p-8 rounded-3xl shadow-2xl transition-all hover:scale-105"
          >
            <span className="text-xs uppercase tracking-widest text-slate-400 block mb-1 font-mono">OYUN PIN KODU</span>
            <div className="text-5xl md:text-7xl lg:text-8xl font-black tracking-widest font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-white">
              {room.pin.slice(0, 3)} {room.pin.slice(3)}
            </div>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-purple-300 opacity-80 group-hover:opacity-100 transition-opacity">
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Kopyalamak için tıkla</span>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-slate-400 text-sm">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-white">{room.players.length}</span>
            <span>katılımcı lobide bekliyor</span>
          </div>
        </div>
      </div>

      {/* Bottom Area: Joined Players Grid */}
      <div className="relative z-10 bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-6 min-h-[140px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Katılan Yarışmacılar ({room.players.length})
            </h3>
          </div>

          {room.players.length === 0 && (
            <span className="text-xs text-slate-500 animate-pulse">
              Katılımcıların girmesi bekleniyor...
            </span>
          )}
        </div>

        {room.players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-slate-500 text-sm">
            <Users className="w-8 h-8 stroke-1 text-slate-600 mb-2" />
            <p>Henüz kimse katılmadı. Yukarıdaki PIN kodunu veya QR kodu paylaşın!</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {room.players.map((player) => (
              <div
                key={player.id}
                className="group relative flex items-center gap-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 px-4 py-2.5 rounded-xl shadow-md transition-all duration-200 animate-float"
              >
                <span className="text-2xl select-none">{player.avatar}</span>
                <span className="text-sm font-bold text-white tracking-wide truncate max-w-[120px]">
                  {player.nickname}
                </span>

                <button
                  onClick={() => onKickPlayer(player.id)}
                  title="Oyuncuyu Çıkar"
                  className="opacity-0 group-hover:opacity-100 ml-1 p-1 rounded-md bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
