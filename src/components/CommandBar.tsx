import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEcosystem } from '../store';
import { ViewState } from '../types/ecosystem';
import { 
  ChevronDown, Bot, Users, Key, Rocket, Server, Activity, 
  Wifi, WifiOff, Download, MonitorDown, ExternalLink, Link2, 
  Copy, Check, Globe, Compass, CheckCircle2, Sparkles, X, Info, Laptop,
  CreditCard, ShieldCheck, DollarSign
} from 'lucide-react';
import { ensureUrl, openExternalUrl } from '../utils/url';

export default function CommandBar({ onOpenRoster }: { onOpenRoster: () => void }) {
  const { activeView, setActiveView, activeAgent } = useEcosystem();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [linksMenuOpen, setLinksMenuOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [installNotification, setInstallNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detect standalone mode (already running as installed PWA desktop app)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      // Prevent browser mini-infobar default
      e.preventDefault();
      // Store event locally in state and globally on window
      setDeferredPrompt(e);
      (window as any).__deferredPrompt = e;
      console.log('Stored beforeinstallprompt event for Desktop App installation');
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      (window as any).__deferredPrompt = null;
      setInstallNotification({
        type: 'success',
        message: 'Dragon9 Ecosystem was successfully installed as a Desktop App!'
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Pick up globally stashed event if dispatched before mount
    if ((window as any).__deferredPrompt) {
      setDeferredPrompt((window as any).__deferredPrompt);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (installNotification) {
      const timer = setTimeout(() => {
        setInstallNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [installNotification]);

  const handleInstallDesktopApp = async () => {
    const promptEvent = deferredPrompt || (window as any).__deferredPrompt;

    if (promptEvent) {
      try {
        // Trigger the browser's native PWA installation prompt using the stored beforeinstallprompt event
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          (window as any).__deferredPrompt = null;
          setInstallNotification({
            type: 'success',
            message: 'Dragon9 Desktop App installed successfully! You can launch it anytime from your Applications or Dock.'
          });
        } else {
          setInstallNotification({
            type: 'info',
            message: 'Desktop App installation prompt was dismissed.'
          });
        }
      } catch (err) {
        console.error('Error invoking native beforeinstallprompt:', err);
      }
    } else if (isInstalled) {
      setInstallNotification({
        type: 'success',
        message: 'Dragon9 Ecosystem is already installed and running in Desktop mode!'
      });
    } else {
      // If deferredPrompt is null (e.g. running in an iframe sandbox or before browser dispatches the event)
      setInstallGuideOpen(true);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
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
    { id: 'payments', label: 'PayPal & Checkout (#165059)', icon: <CreditCard className="w-4 h-4 text-emerald-400" /> },
  ];

  const currentView = views.find(v => v.id === activeView);

  const ecosystemLinks = [
    {
      id: 'dragon9-payments',
      name: 'Enterprise Checkout & PayPal (#165059)',
      badge: 'PAYPAL & ALL METHODS',
      url: window.location.origin,
      viewTarget: 'payments' as ViewState,
      description: 'Real PayPal, Cards, Apple/Google Pay, Wire & Crypto (#165059)'
    },
    {
      id: 'aegis-studio',
      name: 'Aegis Agent Generator',
      badge: 'AI STUDIO',
      url: 'https://aegis-agent-generator.ai.studio/',
      viewTarget: 'aegis' as ViewState,
      description: 'Multi-agent prompt generator and design studio'
    },
    {
      id: 'dragon9-run',
      name: 'Dragon9 Ecosystem',
      badge: 'CLOUD RUN',
      url: 'https://dragon9-ecosystem-612293447363.asia-southeast1.run.app',
      viewTarget: 'gateway' as ViewState,
      description: 'Production Cloud Run gateway & asset monetization'
    },
    {
      id: 'revenue-engine',
      name: 'RevenueEngine AI',
      badge: 'INTERNAL SUITE',
      url: window.location.origin,
      viewTarget: 'revenue' as ViewState,
      description: 'MEDDPICC deal auditor & autonomous worker terminal'
    }
  ];

  return (
    <div className="fixed top-0 inset-x-0 z-40 p-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto gap-3">
        
        {/* Switcher & Network Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setLinksMenuOpen(false);
              }}
              className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl text-white shadow-xl hover:bg-slate-800 transition-colors"
            >
              {currentView?.icon}
              <span className="font-medium text-sm hidden sm:inline">{currentView?.label}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </motion.button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: 'spring', mass: 0.8, stiffness: 120, damping: 14 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl p-2 flex flex-col gap-1 z-50"
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Ecosystem Modules
                  </div>
                  {views.map(view => (
                    <button
                      key={view.id}
                      onClick={() => {
                        setActiveView(view.id);
                        setDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${activeView === view.id ? 'bg-indigo-500/20 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-white/5'}`}
                    >
                      <span className="flex items-center gap-2.5">
                        {view.icon}
                        {view.label}
                      </span>
                      {activeView === view.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium tracking-wide ${isOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
            {isOnline ? (
              <><Wifi className="w-3.5 h-3.5" /> LIVE CONNECTION</>
            ) : (
              <><WifiOff className="w-3.5 h-3.5" /> LOCAL OFFLINE</>
            )}
          </div>
        </div>

        {/* Action Controls & External Links Hub */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick PayPal & Checkout Button */}
          <motion.button
            id="btn-quick-paypal-checkout"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveView('payments')}
            className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-white shadow-lg transition-all text-xs sm:text-sm font-medium border ${
              activeView === 'payments'
                ? 'bg-blue-600 border-blue-400 text-white ring-2 ring-blue-500/30'
                : 'bg-slate-900/90 hover:bg-slate-800 border-indigo-500/30 text-indigo-200 hover:text-white'
            }`}
            title="Open real PayPal gateway & accept all payment methods for Ref #165059"
          >
            <span className="italic font-black text-blue-400 text-xs">P</span>
            <span className="hidden sm:inline font-semibold">PayPal & Pay #165059</span>
            <span className="sm:hidden font-semibold">Pay #165059</span>
            <span className="hidden md:inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ALL METHODS
            </span>
          </motion.button>

          {/* Install Desktop App Button */}
          <motion.button
            id="btn-install-desktop-app"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleInstallDesktopApp}
            className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-white shadow-lg transition-all text-xs sm:text-sm font-medium border ${
              isInstalled
                ? 'bg-slate-800/90 border-emerald-500/40 text-emerald-300 hover:bg-slate-800 hover:border-emerald-500/60'
                : deferredPrompt
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.35)]'
                : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400/30 shadow-[0_0_15px_rgba(79,70,229,0.25)]'
            }`}
            title={
              isInstalled
                ? 'Dragon9 Ecosystem is running in Desktop App mode'
                : deferredPrompt
                ? 'Native PWA install prompt ready - Click to install desktop app'
                : 'Install Dragon9 Ecosystem as a native Desktop App (PWA)'
            }
          >
            {isInstalled ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <MonitorDown className="w-4 h-4 text-indigo-100 shrink-0" />
            )}
            <span className="hidden sm:inline font-semibold tracking-wide">
              {isInstalled ? 'Desktop App Installed' : 'Install Desktop App'}
            </span>
            <span className="sm:hidden font-semibold">
              {isInstalled ? 'Installed' : 'Install App'}
            </span>
            {deferredPrompt && !isInstalled && (
              <span className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-bold bg-indigo-300 text-indigo-950 rounded uppercase tracking-wider">
                Prompt Ready
              </span>
            )}
          </motion.button>

          {/* Direct External Link Badges for Desktop */}
          <a
            href="https://aegis-agent-generator.ai.studio/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => openExternalUrl('https://aegis-agent-generator.ai.studio/', e)}
            className="hidden xl:flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 hover:border-indigo-500/50 hover:bg-indigo-500/10 rounded-xl text-indigo-300 hover:text-indigo-200 shadow-xl transition-all text-xs font-medium"
            title="Open deployed AI Studio applet in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>aegis-agent-generator.ai.studio</span>
          </a>

          <a
            href="https://dragon9-ecosystem-612293447363.asia-southeast1.run.app"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => openExternalUrl('https://dragon9-ecosystem-612293447363.asia-southeast1.run.app', e)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10 rounded-xl text-purple-300 hover:text-purple-200 shadow-xl transition-all text-xs font-medium"
            title="Open production Cloud Run gateway in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>dragon9-ecosystem.run.app</span>
          </a>

          {/* Universal Links Menu Popover (Responsive for all screen sizes) */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setLinksMenuOpen(!linksMenuOpen);
                setDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all shadow-xl backdrop-blur-md ${linksMenuOpen ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900/80 text-slate-300 hover:text-white border-white/10 hover:bg-slate-800'}`}
              title="Ecosystem Links & URLs"
            >
              <Globe className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Links</span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </motion.button>

            <AnimatePresence>
              {linksMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: 'spring', mass: 0.8, stiffness: 120, damping: 14 }}
                  className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl overflow-hidden shadow-2xl p-3 flex flex-col gap-2 z-50 text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 px-1">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-indigo-400" />
                      Ecosystem Endpoints & Links
                    </span>
                    <span className="text-[10px] text-slate-400">All Live & Functional</span>
                  </div>

                  <div className="space-y-2 py-1">
                    {ecosystemLinks.map(link => (
                      <div key={link.id} className="p-2.5 bg-slate-800/60 rounded-xl border border-white/5 hover:border-white/15 transition-colors space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-200 text-xs truncate">{link.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                            {link.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{link.description}</p>
                        <p className="text-[10px] font-mono text-slate-500 truncate select-all">{link.url}</p>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => {
                              openExternalUrl(link.url);
                              setLinksMenuOpen(false);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Open URL</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveView(link.viewTarget);
                              setLinksMenuOpen(false);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Compass className="w-3 h-3 text-emerald-400" />
                            <span>Switch View</span>
                          </button>

                          <button
                            onClick={() => handleCopy(link.url, link.id)}
                            className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                            title="Copy link"
                          >
                            {copiedUrl === link.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 px-1">
                    <span>Export app for offline distribution:</span>
                    <button
                      onClick={() => {
                        exportStandaloneHtml();
                        setLinksMenuOpen(false);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> HTML Download
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportStandaloneHtml}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 hover:bg-slate-800 rounded-xl text-slate-300 shadow-xl transition-colors text-xs font-medium"
            title="Export Standalone HTML App"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export HTML</span>
          </motion.button>

          <div className="hidden sm:flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-xl shadow-xl">
            <div className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium tracking-wide uppercase hidden xl:inline">Copilot:</span>
            <span className="text-xs font-semibold text-white truncate max-w-[120px]">{activeAgent?.name || 'None'}</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenRoster}
            className="p-2 sm:p-2.5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl text-indigo-400 hover:text-indigo-300 shadow-xl transition-colors shrink-0"
            title="Agent Roster"
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>

      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {installNotification && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="pointer-events-auto mt-2 max-w-md mx-auto bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2">
              {installNotification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              )}
              <span className="text-slate-200">{installNotification.message}</span>
            </div>
            <button
              onClick={() => setInstallNotification(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Desktop Installation Modal Dialog */}
      <AnimatePresence>
        {installGuideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Install Desktop App</h3>
                    <p className="text-xs text-slate-400">Run Dragon9 Ecosystem as a native, standalone desktop application</p>
                  </div>
                </div>
                <button
                  onClick={() => setInstallGuideOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {deferredPrompt ? (
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-indigo-300 font-medium text-sm">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Native Installation Prompt Ready</span>
                  </div>
                  <p className="text-xs text-indigo-200/80">
                    Your browser has prepared the native desktop installation package. Click below to launch the system prompt.
                  </p>
                  <button
                    onClick={() => {
                      setInstallGuideOpen(false);
                      handleInstallDesktopApp();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg transition-all"
                  >
                    <MonitorDown className="w-4 h-4" />
                    <span>Trigger Native Installation Now</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      Browsers restrict native installation prompts inside sandboxed iframes (such as preview environments). For direct native installation, launch the app in a standalone tab or use your browser's address bar install icon.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-800/50 border border-white/5 rounded-xl space-y-3">
                    <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Fastest Direct Installation:</h4>
                    <button
                      onClick={() => {
                        window.open(window.location.href, '_blank');
                        setInstallGuideOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open in Standalone Tab to Install</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="font-semibold text-slate-200">Browser Direct Install Options:</div>
                    <ul className="space-y-1.5 pl-4 list-disc text-slate-400">
                      <li><strong className="text-slate-200">Google Chrome / Microsoft Edge:</strong> Click the <span className="text-indigo-300">⨁ Install Dragon9 Ecosystem</span> button on the right side of the address bar.</li>
                      <li><strong className="text-slate-200">Safari (macOS Sonoma+):</strong> Click <em>File → Add to Dock...</em> to generate a native standalone macOS desktop app.</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setInstallGuideOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
