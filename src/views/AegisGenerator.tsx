import React, { useRef } from 'react';
import { useEcosystem } from '../store';
import { Bot, Save, Download, Upload, Server, ArrowRight, Shield } from 'lucide-react';

export default function AegisGenerator() {
  const { activeAgent, updateActiveAgent, setActiveView } = useEcosystem();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!activeAgent) return null;

  const handleChange = (field: string, value: any) => {
    updateActiveAgent({ ...activeAgent, [field]: value });
  };

  const handleToolChange = (tool: string, value: boolean) => {
    updateActiveAgent({
      ...activeAgent,
      tools: { ...activeAgent.tools, [tool]: value }
    });
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeAgent, null, 2));
    const el = document.createElement('a');
    el.setAttribute("href", dataStr);
    el.setAttribute("download", `${activeAgent.name.toLowerCase().replace(/\s+/g, '_')}_config.json`);
    document.body.appendChild(el);
    el.click();
    el.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target?.result as string);
        if (config && config.id && config.name) {
          updateActiveAgent(config);
        }
      } catch (err) {
        console.error("Failed to parse JSON", err);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportRunner = () => {
    const script = `// Auto-generated Agent Runner for ${activeAgent.name}
const config = ${JSON.stringify(activeAgent, null, 2)};

async function runAutonomousLoop() {
  console.log(\`Starting Autonomous Agent: \${config.name}\`);
  console.log(\`Role: \${config.role} | Archetype: \${config.archetype}\`);
  // Insert LLM SDK instantiation and tool execution logic here.
}

runAutonomousLoop().catch(console.error);
`;
    const dataStr = "data:text/javascript;charset=utf-8," + encodeURIComponent(script);
    const el = document.createElement('a');
    el.setAttribute("href", dataStr);
    el.setAttribute("download", `${activeAgent.name.toLowerCase().replace(/\s+/g, '_')}_runner.js`);
    document.body.appendChild(el);
    el.click();
    el.remove();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 pt-16">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
            <Bot className="w-8 h-8 text-indigo-500" />
            Aegis Agent Generator
          </h1>
          <p className="text-slate-400 mt-2">Design, configure, and export autonomous agents.</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportJSON} />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-slate-300 transition-colors">
            <Upload className="w-4 h-4" /> Import JSON
          </button>
          <button onClick={handleExportJSON} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-slate-300 transition-colors">
            <Download className="w-4 h-4" /> Export JSON
          </button>
        </div>
      </header>

      <div className="grid md:grid-cols-[2fr_1fr] gap-8">
        
        {/* Left Column: Form */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-xl border border-white/10 space-y-6">
            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-4">Agent Identity</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Agent Name</label>
                <input 
                  type="text" 
                  value={activeAgent.name} 
                  onChange={e => handleChange('name', e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Core Role</label>
                <input 
                  type="text" 
                  value={activeAgent.role} 
                  onChange={e => handleChange('role', e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Persona Archetype</label>
              <input 
                type="text" 
                value={activeAgent.archetype} 
                onChange={e => handleChange('archetype', e.target.value)}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="e.g. Sovereign Advisor, Analytical Researcher"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">System Prompt / Guardrails</label>
              <textarea 
                value={activeAgent.systemPrompt} 
                onChange={e => handleChange('systemPrompt', e.target.value)}
                rows={8}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Tools & Deployment */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Autonomous Permissions
            </h2>
            
            <div className="space-y-4">
              {[
                { id: 'search_web', label: 'Live Web Search' },
                { id: 'send_email', label: 'API Email Dispatch' },
                { id: 'crm_writeback', label: 'CRM Writeback' },
                { id: 'stripe_billing_event', label: 'Stripe Billing Events' },
              ].map(tool => (
                <label key={tool.id} className="flex items-center gap-3 p-3 bg-slate-800/50 border border-white/5 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                  <input 
                    type="checkbox"
                    checked={activeAgent.tools[tool.id as keyof typeof activeAgent.tools]}
                    onChange={e => handleToolChange(tool.id, e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900"
                  />
                  <span className="text-slate-300 font-medium">{tool.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10 space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Deployment</h2>
            
            <button onClick={handleExportRunner} className="w-full flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white py-3 px-4 rounded-xl font-medium transition-colors">
              <Server className="w-5 h-5" /> Export Node.js Runner
            </button>
            
            <button 
              onClick={() => setActiveView('revenue')}
              className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-[0_0_20px_rgba(79,70,229,0.3)]"
            >
              Launch in RevenueEngine <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
