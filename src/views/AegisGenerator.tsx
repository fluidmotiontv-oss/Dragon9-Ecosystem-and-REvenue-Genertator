import React, { useRef, useState } from 'react';
import { useEcosystem } from '../store';
import { Bot, Save, Download, Upload, Server, ArrowRight, Shield, Globe, ExternalLink, Copy, Check } from 'lucide-react';

export default function AegisGenerator() {
  const { activeAgent, updateActiveAgent, setActiveView } = useEcosystem();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedStudio, setCopiedStudio] = useState(false);
  const [copiedCloudRun, setCopiedCloudRun] = useState(false);

  if (!activeAgent) return null;

  const studioUrl = activeAgent.studioUrl || 'https://aegis-agent-generator.ai.studio/';
  const cloudRunUrl = activeAgent.cloudRunUrl || 'https://dragon9-ecosystem-612293447363.asia-southeast1.run.app';

  const handleCopyStudio = () => {
    navigator.clipboard.writeText(studioUrl);
    setCopiedStudio(true);
    setTimeout(() => setCopiedStudio(false), 2000);
  };

  const handleCopyCloudRun = () => {
    navigator.clipboard.writeText(cloudRunUrl);
    setCopiedCloudRun(true);
    setTimeout(() => setCopiedCloudRun(false), 2000);
  };

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
    const exportPayload = {
      ...activeAgent,
      studioUrl,
      cloudRunUrl
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
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
          updateActiveAgent({
            ...config,
            studioUrl: config.studioUrl || studioUrl,
            cloudRunUrl: config.cloudRunUrl || cloudRunUrl
          });
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
// Production AI Studio Applet: ${studioUrl}
// Production Cloud Run Gateway: ${cloudRunUrl}
const config = ${JSON.stringify({ ...activeAgent, studioUrl, cloudRunUrl }, null, 2)};

async function runAutonomousLoop() {
  console.log(\`[AEGIS RUNTIME] Initializing \${config.name}\`);
  console.log(\`Role: \${config.role} | Archetype: \${config.archetype}\`);
  console.log(\`AI Studio Applet: \${config.studioUrl}\`);
  console.log(\`Cloud Run Gateway: \${config.cloudRunUrl}\`);
  console.log('Active Tools:', config.tools);
  
  // Connect with live Aegis runtime and dispatch autonomously
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
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12 pt-16">
      
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
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-slate-300 transition-colors text-sm">
            <Upload className="w-4 h-4" /> Import JSON
          </button>
          <button onClick={handleExportJSON} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-slate-300 transition-colors text-sm">
            <Download className="w-4 h-4" /> Export JSON
          </button>
        </div>
      </header>

      {/* Dual Deployed Production Targets Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Target 1: AI Studio Applet */}
        <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/70 to-slate-900/40 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">AI Studio Applet</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-xs font-mono text-white/90 mt-0.5 select-all break-all">
                {studioUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={handleCopyStudio}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-xs font-medium text-slate-300 transition-colors"
              title="Copy URL"
            >
              {copiedStudio ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedStudio ? 'Copied' : 'Copy'}
            </button>
            <a
              href={studioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 rounded-lg text-xs font-medium text-white shadow-md transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open</span>
            </a>
          </div>
        </div>

        {/* Target 2: Cloud Run Gateway */}
        <div className="bg-gradient-to-r from-purple-950/40 via-slate-900/70 to-slate-900/40 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">Cloud Run Ecosystem</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PRODUCTION
                </span>
              </div>
              <p className="text-xs font-mono text-white/90 mt-0.5 select-all break-all">
                {cloudRunUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={handleCopyCloudRun}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-xs font-medium text-slate-300 transition-colors"
              title="Copy URL"
            >
              {copiedCloudRun ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedCloudRun ? 'Copied' : 'Copy'}
            </button>
            <a
              href={cloudRunUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 border border-purple-400/30 rounded-lg text-xs font-medium text-white shadow-md transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open</span>
            </a>
          </div>
        </div>
      </div>

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
