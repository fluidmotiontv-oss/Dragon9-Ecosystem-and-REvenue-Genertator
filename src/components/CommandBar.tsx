import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEcosystem } from '../store';
import { ViewState } from '../types/ecosystem';
import { ChevronDown, Bot, Users, Key, Rocket, Server, Activity, Wifi, WifiOff, Download, MonitorDown, ExternalLink } from 'lucide-react';

export default function CommandBar({ onOpenRoster }: { onOpenRoster: () => void }) {
  const { activeView, setActiveView, activeAgent } = useEcosystem();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const exportStandaloneHtml = async () => {
    try {
      const response = await fetch('/');
      const htmlText = await response.text();
      const blob = new Blob([htmlText], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dragon9_ecosystem_offline.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export HTML', e);
    }
  };

  const views: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'gateway', label: 'Dragon9 Gateway', icon: <Server className="w-4 h-4" /> },
    { id: 'aegis', label: 'Aegis Agent Generator', icon: <Bot className="w-4 h-4" /> },
    { id: 'revenue', label: 'RevenueEngine AI', icon: <Activity className="w-4 h-4" /> },
  ];

  const currentView = views.find(v => v.id === activeView);

  return (
    <div className="fixed top-0 inset-x-0 z-40 p-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        
        {/* Switcher & Network Status */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-white shadow-xl hover:bg-slate-800 transition-colors"
            >
              {currentView?.icon}
              <span className="font-medium text-sm">{currentView?.label}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
            </motion.button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: 'spring', mass: 0.8, stiffness: 120, damping: 14 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl p-2 flex flex-col gap-1"
                >
                  {views.map(view => (
                    <button
                      key={view.id}
                      onClick={() => {
                        setActiveView(view.id);
                        setDropdownOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${activeView === view.id ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-white/5'}`}
                    >
                      {view.icon}
                      {view.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium tracking-wide ${isOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
            {isOnline ? (
              <><Wifi className="w-3.5 h-3.5" /> ● LIVE CLOUD CONNECTION</>
            ) : (
              <><WifiOff className="w-3.5 h-3.5" /> ○ LOCAL OFFLINE RUNTIME</>
            )}
          </div>
        </div>

        {/* Active Copilot Badge & Controls */}
        <div className="flex items-center gap-3">
          {deferredPrompt && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 rounded-xl text-white shadow-[0_0_15px_rgba(79,70,229,0.2)] transition-colors text-sm font-medium"
            >
              <MonitorDown className="w-4 h-4" />
              Install App
            </motion.button>
          )}

          <a
            href="https://aegis-agent-generator.ai.studio/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 hover:border-indigo-500/50 hover:bg-indigo-500/10 rounded-xl text-indigo-300 hover:text-indigo-200 shadow-xl transition-all text-xs font-medium"
            title="Open deployed AI Studio applet"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span>aegis-agent-generator.ai.studio</span>
          </a>

          <a
            href="https://dragon9-ecosystem-612293447363.asia-southeast1.run.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10 rounded-xl text-purple-300 hover:text-purple-200 shadow-xl transition-all text-xs font-medium"
            title="Open production Cloud Run gateway"
          >
            <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
            <span>dragon9-ecosystem.run.app</span>
          </a>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportStandaloneHtml}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 hover:bg-slate-800 rounded-xl text-slate-300 shadow-xl transition-colors text-sm font-medium"
            title="Export Standalone HTML App"
          >
            <Download className="w-4 h-4" />
            Export HTML
          </motion.button>

          <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl shadow-xl">
            <div className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </div>
            <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Active Copilot:</span>
            <span className="text-sm font-semibold text-white">{activeAgent?.name || 'None'}</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenRoster}
            className="p-2.5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl text-indigo-400 hover:text-indigo-300 shadow-xl transition-colors"
            title="Agent Roster"
          >
            <Users className="w-5 h-5" />
          </motion.button>
        </div>

      </div>
    </div>
  );
}
