import React from 'react';
import { useEcosystem } from '../store';
import { ViewState } from '../types/ecosystem';
import { 
  Rocket, Server, ShieldCheck, Activity, CreditCard, 
  ExternalLink, Sparkles, ArrowRight, Layout, Zap, Bot, Globe
} from 'lucide-react';
import { ensureUrl, openExternalUrl } from '../utils/url';

export default function AppShowroom() {
  const { setActiveView } = useEcosystem();

  const internalApps = [
    {
      id: 'gateway',
      title: 'Dragon9 Gateway',
      description: 'Central orchestrator for the Dragon9 Cloud Run ecosystem. Monitors server clusters and environment settings.',
      icon: <Server className="w-8 h-8 text-indigo-400" />,
      color: 'indigo',
      viewTarget: 'gateway' as ViewState
    },
    {
      id: 'revenue',
      title: 'RevenueEngine AI',
      description: 'Autonomous MEDDPICC sales auditor. Conducts real-time deal deep-dives and orchestrates client outreach.',
      icon: <Activity className="w-8 h-8 text-emerald-400" />,
      color: 'emerald',
      viewTarget: 'revenue' as ViewState
    },
    {
      id: 'aegis',
      title: 'Aegis Agent Generator',
      description: 'Multi-agent prompt generator and design studio. Forge new AI agent archetypes directly into the ecosystem.',
      icon: <Bot className="w-8 h-8 text-blue-400" />,
      color: 'blue',
      viewTarget: 'aegis' as ViewState
    },
    {
      id: 'payments',
      title: 'Payments Checkout & Ledger',
      description: 'Universal payment terminal enforcing the 90/9/1 Sovereign Revenue distribution via smart ledger.',
      icon: <CreditCard className="w-8 h-8 text-amber-400" />,
      color: 'amber',
      viewTarget: 'payments' as ViewState
    }
  ];

  const externalApps = [
    {
      id: 'ai-studio-workspace',
      name: 'AI Studio Workspace (af26f9f8)',
      badge: 'LIVE WORKSPACE',
      url: 'https://aistudio.google.com/app/apps/af26f9f8-73f5-422e-876b-00a4b0739275?showPreview=true&showAssistant=true',
      description: 'Google AI Studio Assistant workspace and live preview console for the Dragon9 AI ecosystem.'
    },
    {
      id: 'aegis-studio-ext',
      name: 'Aegis Agent Generator (Standalone)',
      badge: 'AI STUDIO',
      url: 'https://aegis-agent-generator.ai.studio/',
      description: 'Multi-agent prompt generator and design studio (External Deployment).'
    },
    {
      id: 'dragon9-run-ext',
      name: 'Dragon9 Ecosystem Run',
      badge: 'CLOUD RUN',
      url: 'https://dragon9-ecosystem-612293447363.asia-southeast1.run.app',
      description: 'Production Cloud Run gateway & asset monetization instance.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16 pt-6 px-4">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-white/10 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5" />
              D9 App Showroom
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Dragon 9 Autonomous <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">Application Portfolio</span>
          </h1>
          <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
            Access the full suite of Sovereign applications, from the Revenue Engine to the MEDDPICC Auditor. 
            All tools operate in synergy under the 90/9/1 Protocol.
          </p>
        </div>
      </div>

      {/* Internal D9 Apps Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <Zap className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">Internal Systems & Portals</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {internalApps.map((app) => (
            <div 
              key={app.id}
              onClick={() => setActiveView(app.viewTarget)}
              className="p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-indigo-500/50 rounded-2xl cursor-pointer transition-all hover:bg-slate-800/80 hover:-translate-y-1 shadow-lg group relative overflow-hidden flex flex-col justify-between min-h-[220px]"
            >
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none"></div>
              
              <div className="space-y-4 relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-${app.color}-500/10 border border-${app.color}-500/20 flex items-center justify-center shadow-inner`}>
                  {app.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{app.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {app.description}
                </p>
              </div>

              <div className="pt-4 flex items-center text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                Initialize System <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* External / Cloud App Grid */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <Globe className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">External Cloud Deployments</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {externalApps.map((app) => (
            <div 
              key={app.id}
              onClick={() => openExternalUrl(app.url)}
              className="p-5 bg-slate-900/40 border border-white/5 hover:border-emerald-500/30 rounded-2xl cursor-pointer transition-all hover:bg-slate-800/60 group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                  {app.badge}
                </span>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="font-bold text-white mb-2">{app.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-3">
                {app.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
