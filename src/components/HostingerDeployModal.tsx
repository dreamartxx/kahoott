import React, { useState } from 'react';
import { X, Globe, Check, Copy, Download, Database, GitBranch, ArrowUpRight, Terminal, Server } from 'lucide-react';

interface HostingerDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HostingerDeployModal: React.FC<HostingerDeployModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'github' | 'database' | 'overview'>('overview');
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const targetSite = 'https://grey-cassowary-525647.hostingersite.com/';

  const githubWorkflowYaml = `name: Deploy to Hostinger

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: 🚀 Checkout Repository
        uses: actions/checkout@v4

      - name: 📦 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: 📥 Install Dependencies
        run: npm ci

      - name: ⚙️ Build Application
        run: npm run build
        env:
          VITE_HOSTINGER_URL: https://grey-cassowary-525647.hostingersite.com

      - name: 🌐 Deploy to Hostinger via FTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: \${{ secrets.HOSTINGER_FTP_SERVER }}
          username: \${{ secrets.HOSTINGER_FTP_USERNAME }}
          password: \${{ secrets.HOSTINGER_FTP_PASSWORD }}
          server-dir: public_html/
          local-dir: ./dist/`;

  const copyYaml = () => {
    navigator.clipboard.writeText(githubWorkflowYaml);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  const downloadSql = () => {
    window.open('/api/export/sql', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-950 border border-purple-800/80 text-purple-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Hostinger & GitHub Dağıtım Merkezi</h2>
              <a
                href={targetSite}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-0.5"
              >
                <span>Hedef: {targetSite}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800/80 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Genel Bakış & Durum
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'github'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            GitHub Actions (.yml)
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'database'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Hostinger MySQL Veritabanı
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/50 flex items-start gap-3">
                <Globe className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-1">Hostinger Business Plan Entegrasyonu</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Uygulamanız hem şu anda bu canlı ortamda tam WebSocket desteğiyle çalışmakta, hem de
                    Hostinger web siteniz (<span className="text-purple-300 font-mono">grey-cassowary-525647.hostingersite.com</span>)
                    için hazır GitHub Actions CI/CD otomatik dağıtım pipeline&apos;ı ile donatılmıştır.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center gap-2 text-white font-bold mb-2">
                    <GitBranch className="w-4 h-4 text-emerald-400" />
                    <span>Otomatik GitHub Dağıtımı</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    Kodunuza her yeni commit veya güncelleme geldiğinde, GitHub Actions derlemeyi yapıp Hostinger FTP / public_html dizinine aktarır.
                  </p>
                  <button
                    onClick={() => setActiveTab('github')}
                    className="text-xs text-emerald-400 hover:underline font-semibold"
                  >
                    Action Ayarlarını Görüntüle →
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
                  <div className="flex items-center gap-2 text-white font-bold mb-2">
                    <Database className="w-4 h-4 text-amber-400" />
                    <span>Hostinger MySQL Veritabanı</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    Hostinger hPanel phpMyAdmin üzerinden tek tıkla aktarabileceğiniz şema ve canlı yarışma verilerini barındırır.
                  </p>
                  <button
                    onClick={() => setActiveTab('database')}
                    className="text-xs text-amber-400 hover:underline font-semibold"
                  >
                    SQL Şemasını Görüntüle & İndir →
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">Hızlı Adımlar</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-400">
                  <li>GitHub reposuna projeyi aktarın.</li>
                  <li>GitHub Settings &gt; Secrets bölümüne Hostinger FTP bilgilerinizi ekleyin.</li>
                  <li>Hostinger phpMyAdmin&apos;e veritabanı şemasını yükleyin.</li>
                  <li>Her push işleminde Hostinger siteniz anında güncellenir!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">.github/workflows/deploy.yml</h4>
                  <p className="text-xs text-slate-400">
                    Otomatik dağıtım yapılandırması projede hazırdır.
                  </p>
                </div>
                <button
                  onClick={copyYaml}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {copiedYaml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedYaml ? 'Kopyalandı!' : 'YAML Kopyala'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto max-h-64 leading-relaxed">
                {githubWorkflowYaml}
              </pre>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
                <h5 className="font-bold text-white text-xs mb-2">GitHub Secrets Gereksinimleri:</h5>
                <ul className="text-xs space-y-1 text-slate-400">
                  <li><span className="font-mono text-purple-300">HOSTINGER_FTP_SERVER</span>: Hostinger FTP Sunucu adresi</li>
                  <li><span className="font-mono text-purple-300">HOSTINGER_FTP_USERNAME</span>: FTP kullanıcı adınız</li>
                  <li><span className="font-mono text-purple-300">HOSTINGER_FTP_PASSWORD</span>: FTP şifreniz</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Hostinger MySQL / MariaDB Şeması</h4>
                  <p className="text-xs text-slate-400">
                    Hostinger hPanel -&gt; phpMyAdmin üzerinden içe aktarın (Import).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadSql}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Canlı SQL İndir</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 max-h-60 overflow-y-auto space-y-2">
                <p className="text-slate-500">-- Tablolar: quizzes, questions, game_sessions, leaderboard_records</p>
                <p className="text-purple-400">CREATE TABLE IF NOT EXISTS `quizzes` ( ... );</p>
                <p className="text-purple-400">CREATE TABLE IF NOT EXISTS `questions` ( ... );</p>
                <p className="text-purple-400">CREATE TABLE IF NOT EXISTS `game_sessions` ( ... );</p>
                <p className="text-purple-400">CREATE TABLE IF NOT EXISTS `leaderboard_records` ( ... );</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2">
                <Terminal className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  &ldquo;Canlı SQL İndir&rdquo; butonuna bastığınızda, sistemdeki mevcut tüm varsayılan sorular ve özel yarışmalar Hostinger MySQL veritabanına uygun INSERT sorgularıyla birlikte tek bir .sql dosyası olarak iner.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
