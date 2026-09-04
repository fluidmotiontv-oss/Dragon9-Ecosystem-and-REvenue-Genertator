import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useEcosystem } from '../store';
import { X, Plus, Play, Download, Trash2, Edit, Users } from 'lucide-react';
import { AgentConfig } from '../types/ecosystem';

export default function AgentRosterDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { profiles, activeAgent, updateActiveAgent, updateProfiles, setActiveView } = useEcosystem();

  const handleActivate = (agent: AgentConfig) => {
    updateActiveAgent(agent);
  };

  const handleEdit = (agent: AgentConfig) => {
    updateActiveAgent(agent);
    setActiveView('aegis');
    onClose();
  };

  const handleDelete = (id: string) => {
    updateProfiles(profiles.filter(p => p.id !== id));
  };

  const handleExport = (agent: AgentConfig) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(agent, null, 2));
    const el = document.createElement('a');
    el.setAttribute("href", dataStr);
    el.setAttribute("download", `${agent.name.toLowerCase().replace(/\s+/g, '_')}_config.json`);
    document.body.appendChild(el);
    el.click();
    el.remove();
  };

  const handleCreateNew = () => {
    const newAgent: AgentConfig = {
      id: `agent-${Math.random().toString(36).substr(2, 9)}`,
      name: 'New Agent',
      role: '',
      archetype: '',
      systemPrompt: '',
      tools: { search_web: false, send_email: false, crm_writeback: false, stripe_billing_event: false }
    };
    updateProfiles([...profiles, newAgent]);
    updateActiveAgent(newAgent);
    setActiveView('aegis');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900/95 backdrop-blur-2xl border-l border-indigo-500/30 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-white/10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Agent Roster
              </h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-white/10">
              <button
                onClick={handleCreateNew}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 rounded-xl font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create New Agent
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {profiles.map(agent => {
                const isActive = activeAgent?.id === agent.id;
                const isOrchestrator = agent.name === 'Nexus-Orchestrator';
                const isConductor = agent.name === 'Dragon-Outcome-Conductor';

                return (
                  <div 
                    key={agent.id} 
                    className={`p-4 rounded-xl border ${
                      isActive 
                        ? 'border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/10' 
                        : isConductor || isOrchestrator
                          ? 'border-purple-500/40 bg-purple-950/20'
                          : 'border-white/10 bg-white/5'
                    } flex flex-col gap-3 transition-all`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-medium flex items-center gap-1.5">
                            {agent.name}
                          </h3>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                              Active
                            </span>
                          )}
                          {isOrchestrator && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase border border-purple-500/30">
                              Macro Orchestrator
                            </span>
                          )}
                          {isConductor && (
                            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-200 text-[10px] font-bold uppercase border border-indigo-500/40">
                              Outcome Conductor
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{agent.role || 'Unassigned Role'}</p>
                      </div>
                    </div>
                    
                    {agent.archetype && (
                      <span className="inline-block px-2.5 py-1 rounded bg-slate-800/80 text-slate-300 text-xs font-medium w-fit border border-white/5">
                        {agent.archetype}
                      </span>
                    )}

                    <div className="flex items-center gap-2 mt-2 pt-3 border-t border-white/10">
                      {!isActive && (
                        <button
                          onClick={() => handleActivate(agent)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Play className="w-3.5 h-3.5" /> Activate
                        </button>
                      )}
                      <button onClick={() => handleEdit(agent)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleExport(agent)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors" title="Export JSON">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(agent.id)} className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
