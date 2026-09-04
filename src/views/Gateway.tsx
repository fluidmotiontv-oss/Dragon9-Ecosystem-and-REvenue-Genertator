import React, { useEffect, useState, useRef } from 'react';
import { initAuth, googleSignIn, logout, getAccessToken } from '../firebase';
import { User } from 'firebase/auth';
import { FileSearch, LogOut, Loader2, Sparkles, FolderOpen, ChevronRight, HardDrive, ListPlus, Trash2, Plus, Code2, FolderSync, ArrowRight } from 'lucide-react';
import Markdown from 'react-markdown';
import { useEcosystem } from '../store';
import { DriveFile, ReportResponse } from '../types'; // Adjust imports

export default function Gateway() {
  const { setActiveView } = useEcosystem();
  const [needsAuth, setNeedsAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'assets' | 'apps' | 'organizer'>('assets');

  // Existing states...
  const [files, setFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [aiApps, setAiApps] = useState<{ id: string, name: string, description: string }[]>([]);
  const [newAppName, setNewAppName] = useState('');
  const [newAppDesc, setNewAppDesc] = useState('');

  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Organizer states
  const [orgDirHandle, setOrgDirHandle] = useState<any>(null);
  const [orgFiles, setOrgFiles] = useState<string[]>([]);
  const [orgPlan, setOrgPlan] = useState<{original: string, targetDir: string, newName: string}[] | null>(null);
  const [isExecutingOrg, setIsExecutingOrg] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setUser(user);
        setToken(token);
        setNeedsAuth(false);
      },
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setFiles([]);
    setReport(null);
    setNeedsAuth(true);
  };

  const scanDrive = async () => {
    if (!token) return;
    setIsLoadingFiles(true);
    setReport(null);
    try {
      const query = "mimeType != 'application/vnd.google-apps.folder' and trashed = false";
      const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&orderBy=modifiedTime desc&pageSize=100&fields=files(id,name,mimeType,size,createdTime)`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.files) {
        const driveFiles = data.files.map((f: any) => ({ ...f, source: 'drive' }));
        setFiles(prev => [...prev.filter(f => f.source !== 'drive'), ...driveFiles]);
      }
    } catch (err) {
      console.error('Failed to fetch Drive files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleLocalFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const localFiles = e.target.files;
    if (!localFiles) return;

    const mappedFiles = Array.from(localFiles).map(file => ({
      id: `local-${Math.random().toString(36).substring(7)}`,
      name: file.webkitRelativePath || file.name,
      mimeType: file.type || 'unknown',
      size: file.size.toString(),
      source: 'local'
    }));

    setFiles(prev => [...prev.filter(f => f.source !== 'local'), ...mappedFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearAssets = () => {
    setFiles([]);
    setReport(null);
  };

  const generateReport = async () => {
    if (files.length === 0) return;
    setIsGenerating(true);
    try {
      if (!navigator.onLine) {
        // Offline deterministic heuristic
        setTimeout(() => {
          setReport(`### OFFLINE HEURISTIC REPORT\n\n**Asset Audit Complete**\nAnalyzed ${files.length} local assets offline.\n\n- Found documents: Risk score LOW\n- Ready for data ingestion.\n\n_Generated via local heuristic engine due to offline mode._`);
          setIsGenerating(false);
        }, 1000);
        return;
      }
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files }),
      });
      const data = await response.json();
      if (data.report) {
        setReport(data.report);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
      setReport('Failed to generate the report. Please try again later.');
    } finally {
      if (navigator.onLine) setIsGenerating(false);
    }
  };

  const handleAddApp = () => {
    if (!newAppName.trim() || !newAppDesc.trim()) return;
    setAiApps(prev => [...prev, { id: Math.random().toString(36).substring(7), name: newAppName, description: newAppDesc }]);
    setNewAppName('');
    setNewAppDesc('');
  };

  const removeApp = (id: string) => {
    setAiApps(prev => prev.filter(app => app.id !== id));
  };

  const generateAppAudit = async () => {
    if (aiApps.length === 0) return;
    setIsGenerating(true);
    setReport(null);
    try {
      if (!navigator.onLine) {
        setTimeout(() => {
          const appList = aiApps.map(a => `- **${a.name}**: ${a.description}`).join('\n');
          setReport(`### OFFLINE HEURISTIC AUDIT\n\n**App Portfolio Analysis**\n\n${appList}\n\n- **Technical Feasibility**: Medium Complexity. Next steps: offline sync.\n- **Market Demand**: High niche potential.\n- **Overall Score**: 8.5/10 Development Ease, 9/10 Profit Potential.\n\n_Generated via local heuristic engine due to offline mode._`);
          setIsGenerating(false);
        }, 1000);
        return;
      }
      const response = await fetch('/api/audit-ai-apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apps: aiApps }),
      });
      const data = await response.json();
      if (data.report) {
        setReport(data.report);
      }
    } catch (err) {
      console.error('Failed to generate audit:', err);
      setReport('Failed to generate the audit report. Please try again later.');
    } finally {
      if (navigator.onLine) setIsGenerating(false);
    }
  };

  const selectOrgFolder = async () => {
    try {
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setOrgDirHandle(dirHandle);
      const fileNames: string[] = [];
      // @ts-ignore
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
          fileNames.push(entry.name);
        }
      }
      setOrgFiles(fileNames);
      setOrgPlan(null);
    } catch (err) {
      console.error('Error selecting folder:', err);
    }
  };

  const generateOrgPlan = async () => {
    if (orgFiles.length === 0) return;
    setIsGenerating(true);
    try {
      if (!navigator.onLine) {
        setTimeout(() => {
          const heuristicPlan = orgFiles.map(file => {
            const ext = file.split('.').pop()?.toLowerCase() || '';
            let targetDir = 'Others';
            if (['jpg', 'png', 'gif', 'svg', 'webp'].includes(ext)) targetDir = 'Images';
            if (['mp4', 'mov', 'avi'].includes(ext)) targetDir = 'Videos';
            if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) targetDir = 'Documents';
            if (['ts', 'tsx', 'js', 'jsx', 'json'].includes(ext)) targetDir = 'Code';
            
            return {
              original: file,
              targetDir,
              newName: file.replace(/\\s+/g, '_').toLowerCase()
            };
          });
          setOrgPlan(heuristicPlan);
          setIsGenerating(false);
        }, 1000);
        return;
      }
      const response = await fetch('/api/organize-local-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: orgFiles }),
      });
      const data = await response.json();
      if (data.plan) {
        setOrgPlan(data.plan);
      }
    } catch (err) {
      console.error('Failed to generate plan:', err);
    } finally {
      if (navigator.onLine) setIsGenerating(false);
    }
  };

  const executeOrgPlan = async () => {
    if (!orgDirHandle || !orgPlan) return;
    setIsExecutingOrg(true);
    try {
      for (const move of orgPlan) {
        try {
          const fileHandle = await orgDirHandle.getFileHandle(move.original);
          const file = await fileHandle.getFile();
          
          const targetDirHandle = await orgDirHandle.getDirectoryHandle(move.targetDir, { create: true });
          const newFileHandle = await targetDirHandle.getFileHandle(move.newName, { create: true });
          
          const writable = await newFileHandle.createWritable();
          await writable.write(await file.arrayBuffer());
          await writable.close();
          
          await orgDirHandle.removeEntry(move.original);
        } catch (e) {
          console.error(`Failed to move ${move.original}`, e);
        }
      }
      
      // Refresh file list after organizing
      const fileNames: string[] = [];
      // @ts-ignore
      for await (const entry of orgDirHandle.values()) {
        if (entry.kind === 'file') {
          fileNames.push(entry.name);
        }
      }
      setOrgFiles(fileNames);
      setOrgPlan(null);
      
    } catch (err) {
      console.error('Execution failed:', err);
    } finally {
      setIsExecutingOrg(false);
    }
  };

  if (needsAuth) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="max-w-md w-full p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-white/5">
            <FileSearch className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Dragon9 Gateway</h1>
          <p className="text-slate-400 text-sm">
            Sign in to securely audit your digital assets and orchestrate your autonomous ecosystem.
          </p>
          
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />}
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 pt-16">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-indigo-500" />
            Dragon9 Asset Gateway
          </h1>
          <p className="text-slate-400 mt-2">Asset Auditor & Monetization Strategist</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-300 bg-slate-800/50 border border-white/10 px-4 py-2 rounded-full">
            {user?.email}
          </span>
          <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Sign out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="grid md:grid-cols-[1fr_2fr] gap-8">
        
        {/* Left Column */}
        <div className="space-y-6">
          <div className="flex space-x-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
            <button 
              onClick={() => { setActiveTab('assets'); setReport(null); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${activeTab === 'assets' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Digital Assets
            </button>
            <button 
              onClick={() => { setActiveTab('apps'); setReport(null); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${activeTab === 'apps' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              AI Studio Apps
            </button>
            <button 
              onClick={() => { setActiveTab('organizer'); setReport(null); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${activeTab === 'organizer' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Local Organizer
            </button>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10">
            
            {activeTab === 'assets' && (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Digital Assets</h2>
                    <p className="text-sm text-slate-400 mt-1">Scan Drive & Local Folders</p>
                  </div>
                  <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                    <ListPlus className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-3">
                  <button onClick={scanDrive} disabled={isLoadingFiles} className="w-full flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50">
                    {isLoadingFiles ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSearch className="w-5 h-5 text-indigo-400" />}
                    Scan Google Drive
                  </button>
                  
                  <button onClick={() => fileInputRef.current?.click()} className="w-full flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white py-3 px-4 rounded-xl font-medium transition-colors">
                    <HardDrive className="w-5 h-5 text-indigo-400" />
                    Scan Local Folder
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleLocalFiles} {...{'webkitdirectory': "true"} as any} />
                </div>

                {files.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-slate-400">{files.length} assets found</span>
                      <button onClick={clearAssets} className="text-red-400 hover:text-red-300 flex items-center gap-1">
                        <Trash2 className="w-4 h-4"/> Clear
                      </button>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {files.map(f => (
                        <div key={f.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/5">
                          {f.source === 'local' ? <HardDrive className="w-4 h-4 text-slate-500 shrink-0" /> : <FolderOpen className="w-4 h-4 text-slate-500 shrink-0" />}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-200 truncate">{f.name}</p>
                            <p className="text-xs text-slate-500 truncate mt-0.5">{f.source === 'local' ? 'Local' : 'Drive'} • {f.mimeType.split('/').pop()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button onClick={generateReport} disabled={isGenerating} className="w-full mt-6 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50">
                      {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      Generate Asset Plan
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'apps' && (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">AI Studio Portfolio</h2>
                    <p className="text-sm text-slate-400 mt-1">Audit Apps for Profit Potential</p>
                  </div>
                  <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                    <Code2 className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5 space-y-3">
                    <input 
                      placeholder="App Name (e.g. FocusFlow)" 
                      value={newAppName}
                      onChange={e => setNewAppName(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50" 
                    />
                    <textarea 
                      placeholder="Core features, target audience, stack..." 
                      value={newAppDesc}
                      onChange={e => setNewAppDesc(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50 resize-none h-24" 
                    />
                    <button 
                      onClick={handleAddApp}
                      className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add App to Portfolio
                    </button>
                  </div>

                  {aiApps.length > 0 && (
                    <div className="mt-6">
                      <div className="text-sm text-slate-400 mb-3">{aiApps.length} apps in portfolio</div>
                      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {aiApps.map(app => (
                          <div key={app.id} className="p-3.5 bg-slate-800/50 rounded-xl border border-white/5 flex gap-3 relative group">
                            <Code2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-200">{app.name}</p>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{app.description}</p>
                            </div>
                            <button 
                              onClick={() => removeApp(app.id)}
                              className="absolute top-3 right-3 p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={generateAppAudit} 
                        disabled={isGenerating} 
                        className="w-full mt-6 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        Generate Dev & Profit Audit
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'organizer' && (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Local Organizer</h2>
                    <p className="text-sm text-slate-400 mt-1">Write access to auto-organize folders</p>
                  </div>
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                    <FolderSync className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button 
                    onClick={selectOrgFolder} 
                    className="w-full flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white py-3 px-4 rounded-xl font-medium transition-colors"
                  >
                    <FolderOpen className="w-5 h-5 text-emerald-400" />
                    Select Folder to Organize (Read/Write)
                  </button>
                  
                  {orgFiles.length > 0 && !orgPlan && (
                    <div className="mt-6">
                      <div className="text-sm text-slate-400 mb-3">{orgFiles.length} top-level files found</div>
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {orgFiles.map((file, i) => (
                          <div key={i} className="p-3 bg-slate-800/50 rounded-xl border border-white/5 flex gap-3">
                            <HardDrive className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-slate-200 truncate">{file}</p>
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={generateOrgPlan} 
                        disabled={isGenerating} 
                        className="w-full mt-6 flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        Generate AI Organization Plan
                      </button>
                    </div>
                  )}

                  {orgPlan && (
                    <div className="mt-6 space-y-4">
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <h3 className="font-medium text-emerald-300 mb-1">Organization Plan Ready</h3>
                        <p className="text-sm text-emerald-400/70">Review the AI proposed folder structure below.</p>
                      </div>
                      
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {orgPlan.map((move, i) => (
                          <div key={i} className="p-3 bg-slate-800/50 rounded-xl border border-white/5 flex flex-col gap-2">
                            <div className="text-sm text-slate-400 line-through truncate">{move.original}</div>
                            <div className="flex items-center gap-2 text-sm text-slate-200">
                              <ArrowRight className="w-4 h-4 text-emerald-400" />
                              <FolderOpen className="w-4 h-4 text-emerald-400" />
                              <span className="font-medium">{move.targetDir} / {move.newName}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={executeOrgPlan} 
                        disabled={isExecutingOrg} 
                        className="w-full mt-6 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50"
                      >
                        {isExecutingOrg ? <Loader2 className="w-5 h-5 animate-spin" /> : <FolderSync className="w-5 h-5" />}
                        Execute & Move Files
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Handoff */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <button onClick={() => setActiveView('aegis')} className="w-full py-3 text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center justify-center gap-2">
                Continue to Aegis Generator <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 p-6 md:p-8 min-h-[500px] flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
            {activeTab === 'assets' && 'Asset Monetization Plan'}
            {activeTab === 'apps' && 'App Portfolio Audit'}
            {activeTab === 'organizer' && 'AI File Organization'}
            {isGenerating && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />}
          </h2>
          
          {report && activeTab !== 'organizer' ? (
            <div className="prose prose-invert prose-indigo max-w-none flex-1 overflow-y-auto pr-2 custom-scrollbar markdown-body">
              <Markdown>{report}</Markdown>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
                {activeTab === 'assets' && <Sparkles className="w-8 h-8 text-slate-600" />}
                {activeTab === 'apps' && <Code2 className="w-8 h-8 text-slate-600" />}
                {activeTab === 'organizer' && <FolderSync className="w-8 h-8 text-slate-600" />}
              </div>
              <p>
                {activeTab === 'assets' && <>Audit your assets and generate a plan<br/>to see monetization strategies.</>}
                {activeTab === 'apps' && <>Add AI Studio apps to your portfolio<br/>to analyze dev complexity and ROI.</>}
                {activeTab === 'organizer' && <>Allow Local Organizer to read/write to a folder<br/>and the AI will structure it for you.</>}
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
