import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEcosystem } from '../store';
import {
  Sparkles,
  Zap,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Send,
  SlidersHorizontal,
  Flame,
  Radio,
  Workflow,
  Compass,
  Bot
} from 'lucide-react';
import {
  ConductorHarmonicMode,
  ConductorDirective,
  OutcomeSimulationResult,
  getStoredConductorMode,
  setStoredConductorMode,
  getStoredDirectives,
  saveDirectives,
  simulatePositiveOutcome
} from '../services/conductorEngine';

interface ConductorOrchestratorHubProps {
  currentProspectName?: string;
  currentDealStage?: string;
  currentDealNotes?: string;
  onApplyHarmonizationToOutreach?: (optimizedOutreach: string, score: number) => void;
}

export default function ConductorOrchestratorHub({
  currentProspectName = 'Acme Corp',
  currentDealStage = 'Post-Discovery Follow-Up',
  currentDealNotes = 'Strong Champion with unconfirmed Economic Buyer access. Need to quantify ROI.',
  onApplyHarmonizationToOutreach
}: ConductorOrchestratorHubProps) {
  const { activeAgent, updateActiveAgent, profiles } = useEcosystem();
  const [mode, setMode] = useState<ConductorHarmonicMode>(getStoredConductorMode());
  const [directives, setDirectives] = useState<ConductorDirective[]>(getStoredDirectives());
  const [simulation, setSimulation] = useState<OutcomeSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'monitor' | 'simulator' | 'directives'>('monitor');
  const [customMacroGoal, setCustomMacroGoal] = useState('Compress sales cycles by 40% & guarantee 100% MEDDPICC coverage.');
  const [isDispatching, setIsDispatching] = useState(false);

  // Run simulation whenever prospect, deal, mode, or agent changes
  useEffect(() => {
    handleRunSimulation();
  }, [currentProspectName, currentDealStage, currentDealNotes, mode, activeAgent]);

  const handleModeChange = (newMode: ConductorHarmonicMode) => {
    setMode(newMode);
    setStoredConductorMode(newMode);
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const result = simulatePositiveOutcome(
        currentProspectName || 'Acme Corp',
        currentDealStage || 'Post-Discovery Follow-Up',
        currentDealNotes || 'Evaluating opportunity.',
        250000,
        activeAgent,
        mode
      );
      setSimulation(result);
      setIsSimulating(false);
    }, 250);
  };

  const handleDispatchHarmonicDirective = () => {
    setIsDispatching(true);
    setTimeout(() => {
      const newDirective: ConductorDirective = {
        id: `dir-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        source: 'Dragon-Outcome-Conductor',
        targetAgent: activeAgent?.name || 'Enterprise Deal Closer',
        mode: mode,
        macroDirective: customMacroGoal || 'Maximize positive outcome probability for active enterprise pipeline.',
        microHarmonization: `Paced for ${mode.replace('_', ' ').toUpperCase()} -> Prioritizing ${simulation?.criticalDrivers[0] || 'Executive alignment'}.`,
        positiveOutcomePacing: 'Harmonized Surge (2.4x)',
        expectedLift: `+${Math.round((simulation?.optimizedWinRate || 85) - (simulation?.baselineWinRate || 40))}% Win-Rate Lift`,
        activeStatus: 'executing'
      };

      const updated = [newDirective, ...directives.slice(0, 7)];
      setDirectives(updated);
      saveDirectives(updated);
      setIsDispatching(false);
    }, 400);
  };

  const activateConductorAgent = () => {
    const conductor = profiles.find(p => p.name === 'Dragon-Outcome-Conductor' || p.id === 'agent-9');
    if (conductor) {
      updateActiveAgent(conductor);
    }
  };

  const activateOrchestratorAgent = () => {
    const orchestrator = profiles.find(p => p.name === 'Nexus-Orchestrator' || p.id === 'agent-4');
    if (orchestrator) {
      updateActiveAgent(orchestrator);
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-2xl rounded-2xl border border-indigo-500/30 p-6 shadow-2xl space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
              <Workflow className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Nexus-Orchestrator <span className="text-indigo-400 font-mono text-sm">&harr;</span> Dragon-Outcome-Conductor
              </h2>
              <p className="text-xs text-slate-400">
                Dual-core synchronized intelligence pacing real-time copilot execution to maximize positive revenue outcomes.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Agent Activators & Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={activateOrchestratorAgent}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              activeAgent?.name === 'Nexus-Orchestrator'
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/50 shadow-lg shadow-purple-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/10'
            }`}
            title="Activate Nexus-Orchestrator as active copilot"
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>Orchestrator</span>
            {activeAgent?.name === 'Nexus-Orchestrator' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={activateConductorAgent}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              activeAgent?.name === 'Dragon-Outcome-Conductor'
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/10'
            }`}
            title="Activate Dragon-Outcome-Conductor as active copilot"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Conductor</span>
            {activeAgent?.name === 'Dragon-Outcome-Conductor' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold">
            <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
            <span>Harmonic Sync: LOCKED</span>
          </div>
        </div>
      </div>

      {/* Mode Selector Chips */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
          Conductor Harmonic Strategy & Outcome Mode:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            { id: 'enterprise_value', label: 'Enterprise Value', icon: TrendingUp, desc: 'Deep MEDDPICC & CFO payback' },
            { id: 'velocity_maximizer', label: 'Velocity Maximizer', icon: Zap, desc: 'High cadence & instant booking' },
            { id: 'risk_shielded_consensus', label: 'Risk-Shielded', icon: ShieldCheck, desc: 'InfoSec pre-emption & legal packs' },
            { id: 'revival_surge', label: 'Revival Surge', icon: Flame, desc: '9-word hooks & deferred ramp' },
            { id: 'adaptive_orchestration', label: 'Adaptive Auto', icon: Cpu, desc: 'Dynamic multi-signal harmony' }
          ].map(item => {
            const isSelected = mode === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleModeChange(item.id as ConductorHarmonicMode)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-800/40 hover:bg-slate-800/80 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </div>
                <span className="text-xs font-bold truncate">{item.label}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {[
          { id: 'monitor', label: 'Dual-Core Monitor', icon: Activity },
          { id: 'simulator', label: 'Positive Outcome Simulator', icon: Sparkles },
          { id: 'directives', label: 'Harmonic Directives Feed', icon: Layers }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: Dual-Core Command Monitor */}
      {activeTab === 'monitor' && (
        <div className="grid md:grid-cols-2 gap-4">
          
          {/* Left: Nexus-Orchestrator Macro Hub */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-purple-400" />
                Nexus-Orchestrator Directives (Macro Strategy)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[10px] font-bold">
                STRATEGY CORE
              </span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-lg border border-white/5 space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                <span className="text-purple-400 font-semibold">[ORCHESTRATOR MACRO]:</span> Target account{' '}
                <span className="text-white font-bold">{currentProspectName}</span> in stage{' '}
                <span className="text-indigo-300 font-bold">{currentDealStage}</span>. Directing sub-agents to
                compress deal closing cycle and enforce 100% MEDDPICC qualification rigor.
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Target Ecosystem Pipeline:</span>
                <span className="text-white font-mono font-medium">$1,450,000 ARR</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Delegated Sub-Agent Copilot:</span>
                <span className="text-indigo-300 font-semibold">{activeAgent?.name || 'Enterprise Deal Closer'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Macro Milestone:</span>
                <span className="text-emerald-400 font-medium">Q3 Enterprise Expansion</span>
              </div>
            </div>
          </div>

          {/* Right: Dragon-Outcome-Conductor Real-Time Pacing */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-400" />
                Dragon-Outcome-Conductor (Real-Time Pacing)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] font-bold">
                HARMONIC PACER
              </span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-lg border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Positive Outcome Probability:</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {simulation?.optimizedWinRate || 92}%
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${simulation?.optimizedWinRate || 92}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Harmonic Pacing Rate:</span>
                <span className="text-emerald-400 font-mono font-bold">1.85x Accelerated</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Single-Point Risk Arbitration:</span>
                <span className="text-emerald-400 font-medium">Auto-Shielding ACTIVE</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Expected ROI Multiplier:</span>
                <span className="text-indigo-300 font-bold font-mono">3.4x Incremental Lift</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab Content 2: Positive Outcome Simulator */}
      {activeTab === 'simulator' && simulation && (
        <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Outcome Probability Lift for {simulation.accountName}
            </h3>
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isSimulating ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Re-Simulate</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-white/5">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Baseline Win Rate</span>
              <p className="text-2xl font-bold text-slate-400 font-mono mt-1">{simulation.baselineWinRate}%</p>
              <span className="text-[10px] text-slate-500">Uncalibrated deal trajectory</span>
            </div>

            <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/30">
              <span className="text-[11px] text-indigo-300 uppercase font-semibold">Conductor-Optimized</span>
              <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{simulation.optimizedWinRate}%</p>
              <span className="text-[10px] text-emerald-400 font-semibold">
                +{simulation.optimizedWinRate - simulation.baselineWinRate}% Conversion Probability
              </span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-white/5">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Projected Value Lift</span>
              <p className="text-2xl font-bold text-white font-mono mt-1">
                +${simulation.unlockedIncrementalRoi.toLocaleString()}
              </p>
              <span className="text-[10px] text-indigo-300">Expected ROI Expansion</span>
            </div>
          </div>

          {/* Critical Conversion Drivers */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Conductor Value Drivers & Risk Shields:
            </span>
            <div className="space-y-1.5">
              {simulation.criticalDrivers.map((driver, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-white/5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{driver}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-1">
            <p className="text-xs font-semibold text-indigo-300">Recommended Harmonization Playbook:</p>
            <p className="text-xs text-slate-200">{simulation.recommendedPlaybook}</p>
          </div>
        </div>
      )}

      {/* Tab Content 3: Directives Dispatcher & Live Feed */}
      {activeTab === 'directives' && (
        <div className="space-y-4">
          {/* Custom Dispatcher Form */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-white/10 space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Transmit Macro Orchestrator Directive to Conductor:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customMacroGoal}
                onChange={e => setCustomMacroGoal(e.target.value)}
                placeholder="Enter macro outcome directive..."
                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleDispatchHarmonicDirective}
                disabled={isDispatching}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                {isDispatching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Transmit Directive</span>
              </button>
            </div>
          </div>

          {/* Live Directives Feed */}
          <div className="space-y-2">
            {directives.map(dir => (
              <div
                key={dir.id}
                className="p-3 bg-slate-950/70 border border-white/5 rounded-xl space-y-1.5 text-xs hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 text-[10px]">{dir.timestamp}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                      {dir.source}
                    </span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="text-white font-medium">{dir.targetAgent}</span>
                  </div>
                  <span className="text-emerald-400 font-semibold font-mono text-[11px]">{dir.expectedLift}</span>
                </div>

                <p className="text-slate-300 font-sans">
                  <span className="font-semibold text-slate-200">Macro:</span> {dir.macroDirective}
                </p>
                <p className="text-slate-400 font-mono text-[11px]">
                  <span className="text-indigo-400 font-semibold">Micro-Pacing:</span> {dir.microHarmonization}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Call-to-Action */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Active Harmonization Mode: <strong className="text-white uppercase">{mode.replace('_', ' ')}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleModeChange('adaptive_orchestration')}
            className="text-slate-400 hover:text-white px-2 py-1 rounded transition-colors"
          >
            Reset to Auto
          </button>
          <button
            onClick={activateConductorAgent}
            className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <span>Activate Conductor Copilot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
