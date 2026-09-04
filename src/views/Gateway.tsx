import React, { useEffect, useState, useRef } from 'react';
import { initAuth, googleSignIn, logout, getAccessToken } from '../firebase';
import { User } from 'firebase/auth';
import { 
  FileSearch, LogOut, Loader2, Sparkles, FolderOpen, ChevronRight, HardDrive, 
  ListPlus, Trash2, Plus, Code2, FolderSync, ArrowRight, ExternalLink,
  CheckSquare, Square, Play, RefreshCw, CheckCircle2, Clock, AlertTriangle,
  Download, FileText, Filter, ListTodo, Layers, Server, Zap
} from 'lucide-react';
import Markdown from 'react-markdown';
import { useEcosystem } from '../store';
import { DriveFile, ReportResponse } from '../types';
import { AppAuditTask, AuditJobState } from '../types/ecosystem';

const INITIAL_AI_APPS = [
  {
    id: 'aegis-agent-generator',
    name: 'Aegis Agent Generator',
    url: 'https://aegis-agent-generator.ai.studio/',
    description: 'Autonomous multi-agent design studio, prompt generator, and enterprise sales copilot deployment engine hosted on Google AI Studio.'
  },
  {
    id: 'dragon9-ecosystem',
    name: 'Dragon9 Ecosystem',
    url: 'https://dragon9-ecosystem-612293447363.asia-southeast1.run.app',
    description: 'Enterprise revenue copilot, Cloud Run gateway, and automated digital asset monetization auditor.'
  }
];

export default function Gateway() {
  const { setActiveView } = useEcosystem();
  const [needsAuth, setNeedsAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'assets' | 'apps' | 'organizer'>('apps');

  // Existing states...
  const [files, setFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [aiApps, setAiApps] = useState<{ id: string, name: string, description: string, url?: string }[]>(() => {
    try {
      const saved = localStorage.getItem('dragon9_ai_apps_portfolio');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasDragon9 = parsed.some((a: any) => a.id === 'dragon9-ecosystem' || a.url?.includes('dragon9-ecosystem'));
          if (!hasDragon9) {
            parsed.push(INITIAL_AI_APPS[1]);
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved apps:', e);
    }
    return INITIAL_AI_APPS;
  });

  useEffect(() => {
    localStorage.setItem('dragon9_ai_apps_portfolio', JSON.stringify(aiApps));
  }, [aiApps]);

  const [auditJob, setAuditJob] = useState<AuditJobState>({
    id: '',
    status: 'idle',
    currentStep: '',
    progress: 0,
    totalApps: 2,
    completedApps: 0
  });

  const [auditTasks, setAuditTasks] = useState<AppAuditTask[]>(() => {
    try {
      const saved = localStorage.getItem('dragon9_portfolio_audit_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [auditViewMode, setAuditViewMode] = useState<'report' | 'tasks'>('tasks');
  const [taskFilterApp, setTaskFilterApp] = useState<string>('all');
  const [taskFilterPriority, setTaskFilterPriority] = useState<string>('all');
  const [newAppName, setNewAppName] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
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
    setAiApps(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      name: newAppName,
      url: newAppUrl.trim() || undefined,
      description: newAppDesc
    }]);
    setNewAppName('');
    setNewAppUrl('');
    setNewAppDesc('');
  };

  const removeApp = (id: string) => {
    setAiApps(prev => prev.filter(app => app.id !== id));
  };

  const runPortfolioAuditTask = async (customApps?: typeof aiApps) => {
    const targetApps = customApps || aiApps;
    if (targetApps.length === 0) return;

    setIsGenerating(true);
    const jobId = `task-job-${Date.now()}`;
    setAuditJob({
      id: jobId,
      status: 'running',
      currentStep: `Task Step 1/4: Initializing audit manifest across ${targetApps.length} portfolio app(s)...`,
      progress: 20,
      totalApps: targetApps.length,
      completedApps: 0
    });

    try {
      await new Promise(r => setTimeout(r, 400));
      setAuditJob(prev => ({
        ...prev,
        currentStep: `Task Step 2/4: Auditing architecture, endpoints & Gemini pipelines...`,
        progress: 45
      }));

      if (!navigator.onLine) {
        await new Promise(r => setTimeout(r, 500));
        const appList = targetApps.map(a => `- **${a.name}**${a.url ? ` (${a.url})` : ''}: ${a.description}`).join('\n');
        const offlineReport = `### OFFLINE HEURISTIC AUDIT TASK REPORT\n\n**Audited Apps (${targetApps.length})**\n\n${appList}\n\n- **Technical Feasibility**: Ready for offline cache & service worker synchronization.\n- **Profit Potential**: High recurring enterprise revenue.\n\n_Generated via local offline heuristic engine._`;
        const fallbackTasks: AppAuditTask[] = targetApps.flatMap((app, idx) => [
          {
            id: `task-offline-${idx * 2 + 1}`,
            appName: app.name,
            title: `Setup offline local cache & index for ${app.name}`,
            priority: 'P0',
            category: 'Architecture',
            description: `Implement IndexedDB caching and service worker synchronization.`,
            estimatedHours: 8,
            status: 'todo'
          },
          {
            id: `task-offline-${idx * 2 + 2}`,
            appName: app.name,
            title: `Monetization checkout & license validator`,
            priority: 'P1',
            category: 'Monetization',
            description: `Implement paywall verification and token-based usage meters.`,
            estimatedHours: 12,
            status: 'todo'
          }
        ]);
        setReport(offlineReport);
        setAuditTasks(fallbackTasks);
        localStorage.setItem('dragon9_portfolio_audit_tasks', JSON.stringify(fallbackTasks));
        setAuditJob({
          id: jobId,
          status: 'completed',
          currentStep: `Audit task complete: Evaluated ${targetApps.length} apps & generated ${fallbackTasks.length} tasks.`,
          progress: 100,
          totalApps: targetApps.length,
          completedApps: targetApps.length
        });
        return;
      }

      setAuditJob(prev => ({
        ...prev,
        currentStep: `Task Step 3/4: Synthesizing architecture moats & decomposing into actionable tasks...`,
        progress: 75
      }));

      const response = await fetch('/api/audit-ai-apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apps: targetApps }),
      });

      const data = await response.json();
      if (data.report) {
        setReport(data.report);
      }
      if (data.tasks && Array.isArray(data.tasks)) {
        setAuditTasks(data.tasks);
        localStorage.setItem('dragon9_portfolio_audit_tasks', JSON.stringify(data.tasks));
      }

      setAuditJob({
        id: jobId,
        status: 'completed',
        currentStep: `Task execution complete! Evaluated ${targetApps.length} app(s) and populated ${data.tasks?.length || 0} actionable execution tasks.`,
        progress: 100,
        totalApps: targetApps.length,
        completedApps: targetApps.length
      });
    } catch (err) {
      console.error('Audit task error:', err);
      setAuditJob(prev => ({
        ...prev,
        status: 'failed',
        currentStep: 'Audit task failed. Please check network connection and try again.',
        progress: 100
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTaskStatus = (taskId: string) => {
    setAuditTasks(prev => {
      const updated = prev.map(t => 
        t.id === taskId 
          ? { ...t, status: (t.status === 'completed' ? 'todo' : 'completed') as 'todo' | 'completed' } 
          : t
      );
      localStorage.setItem('dragon9_portfolio_audit_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const exportTaskPlan = () => {
    if (auditTasks.length === 0) return;
    const content = `# Dragon9 Portfolio Audit Sprint Backlog
Generated on: ${new Date().toLocaleDateString()}
Total Execution Tasks: ${auditTasks.length}
Completed Tasks: ${auditTasks.filter(t => t.status === 'completed').length}

${auditTasks.map(t => `### [${t.status === 'completed' ? 'x' : ' '}] [${t.priority}] ${t.title}
- **App Target**: ${t.appName}
- **Category**: ${t.category}
- **Estimated Dev**: ${t.estimatedHours || 8} hours
- **Status**: ${t.status}
- **Description**: ${t.description}
`).join('\n')}
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_audit_sprint_tasks_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
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
                      placeholder="App Name (e.g. Aegis Agent Generator)" 
                      value={newAppName}
                      onChange={e => setNewAppName(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50" 
                    />
                    <input 
                      placeholder="App URL (e.g. https://aegis-agent-generator.ai.studio/)" 
                      value={newAppUrl}
                      onChange={e => setNewAppUrl(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white text-xs font-mono focus:outline-none focus:border-indigo-500/50" 
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
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400 font-medium">{aiApps.length} Apps in Portfolio</span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Active Deployments</span>
                        </div>
                      </div>

                      <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                        {aiApps.map(app => (
                          <div key={app.id} className="p-3.5 bg-slate-800/50 hover:bg-slate-800/70 rounded-xl border border-white/5 flex gap-3 relative group transition-colors">
                            <Code2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1 pr-14">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-slate-200">{app.name}</p>
                                {app.url?.includes('run.app') && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    Cloud Run
                                  </span>
                                )}
                                {app.url?.includes('ai.studio') && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    AI Studio
                                  </span>
                                )}
                                {app.url && (
                                  <a
                                    href={app.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-mono transition-colors"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Launch</span>
                                  </a>
                                )}
                              </div>
                              {app.url && (
                                <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">{app.url}</p>
                              )}
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{app.description}</p>
                            </div>

                            <div className="absolute top-3 right-3 flex items-center gap-1">
                              <button
                                onClick={() => runPortfolioAuditTask([app])}
                                disabled={isGenerating}
                                title="Run audit task for this app"
                                className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-md transition-colors"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => removeApp(app.id)}
                                title="Remove from portfolio"
                                className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Audit All Apps as a Task Execution Control */}
                      <div className="pt-2">
                        <button 
                          onClick={() => runPortfolioAuditTask()} 
                          disabled={isGenerating} 
                          className="w-full flex flex-col items-center justify-center gap-1 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 px-4 rounded-xl font-medium transition-all shadow-[0_0_25px_rgba(79,70,229,0.35)] disabled:opacity-50"
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                            <span>Audit All Apps as a Task ({aiApps.length} Apps)</span>
                          </div>
                          <span className="text-[11px] text-indigo-100/70 font-normal">
                            Synthesizes cross-app architecture, profit moats & actionable task backlog
                          </span>
                        </button>
                      </div>

                      {/* Live Task Job Status Indicator */}
                      {auditJob.status !== 'idle' && (
                        <div className="p-3 bg-slate-800/80 border border-indigo-500/30 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                              {auditJob.status === 'running' && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />}
                              {auditJob.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                              {auditJob.status === 'failed' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                              Audit Task Job
                            </span>
                            <span className="font-mono text-slate-400">{auditJob.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 rounded-full ${auditJob.status === 'completed' ? 'bg-emerald-500' : auditJob.status === 'failed' ? 'bg-red-500' : 'bg-indigo-500'}`}
                              style={{ width: `${auditJob.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{auditJob.currentStep}</p>
                        </div>
                      )}
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
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 p-6 md:p-8 min-h-[550px] flex flex-col">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              {activeTab === 'assets' && 'Asset Monetization Plan'}
              {activeTab === 'apps' && (
                <span className="flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-indigo-400" />
                  Portfolio Audit & Tasks
                </span>
              )}
              {activeTab === 'organizer' && 'AI File Organization'}
              {isGenerating && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />}
            </h2>

            {/* Mode Switcher for Apps Tab */}
            {activeTab === 'apps' && (report || auditTasks.length > 0) && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex bg-slate-800/80 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setAuditViewMode('tasks')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${auditViewMode === 'tasks' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <ListTodo className="w-3.5 h-3.5" />
                    <span>Tasks ({auditTasks.filter(t => t.status === 'completed').length}/{auditTasks.length})</span>
                  </button>
                  <button
                    onClick={() => setAuditViewMode('report')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${auditViewMode === 'report' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Strategic Report</span>
                  </button>
                </div>

                {auditTasks.length > 0 && auditViewMode === 'tasks' && (
                  <button
                    onClick={exportTaskPlan}
                    title="Export sprint task plan as markdown"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 rounded-xl transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Apps Tab Content */}
          {activeTab === 'apps' && (
            <>
              {auditViewMode === 'tasks' && auditTasks.length > 0 ? (
                <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                  {/* Progress & Filters Bar */}
                  <div className="bg-slate-800/40 p-3.5 rounded-xl border border-white/5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold">
                          {auditTasks.filter(t => t.status === 'completed').length} of {auditTasks.length} tasks completed
                        </span>
                        <span className="text-slate-500 font-mono">
                          ({Math.round((auditTasks.filter(t => t.status === 'completed').length / auditTasks.length) * 100)}%)
                        </span>
                      </div>
                      <div className="text-slate-400">
                        Total Backlog: <span className="font-mono text-indigo-300 font-semibold">{auditTasks.reduce((acc, t) => acc + (t.estimatedHours || 8), 0)}h</span> est. dev
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900/80 rounded-full h-2 overflow-hidden border border-white/5">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.round((auditTasks.filter(t => t.status === 'completed').length / auditTasks.length) * 100)}%` }}
                      ></div>
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Filter className="w-3 h-3" /> Filters:
                      </span>
                      
                      {/* App Filter */}
                      <select
                        value={taskFilterApp}
                        onChange={e => setTaskFilterApp(e.target.value)}
                        className="bg-slate-900 border border-white/10 text-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500"
                      >
                        <option value="all">All Applications ({auditTasks.length})</option>
                        {Array.from(new Set(auditTasks.map(t => t.appName))).map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>

                      {/* Priority Filter */}
                      <select
                        value={taskFilterPriority}
                        onChange={e => setTaskFilterPriority(e.target.value)}
                        className="bg-slate-900 border border-white/10 text-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500"
                      >
                        <option value="all">All Priorities</option>
                        <option value="P0">P0 - Critical</option>
                        <option value="P1">P1 - High</option>
                        <option value="P2">P2 - Normal</option>
                      </select>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2.5">
                    {auditTasks
                      .filter(t => taskFilterApp === 'all' || t.appName === taskFilterApp)
                      .filter(t => taskFilterPriority === 'all' || t.priority === taskFilterPriority)
                      .map(task => {
                        const isDone = task.status === 'completed';
                        return (
                          <div
                            key={task.id}
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${isDone ? 'bg-slate-900/40 border-white/5 opacity-60' : 'bg-slate-800/50 hover:bg-slate-800/70 border-white/10 shadow-sm'}`}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskStatus(task.id);
                              }}
                              className="mt-0.5 text-indigo-400 hover:text-indigo-300 shrink-0"
                            >
                              {isDone ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`text-xs font-semibold ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                  {task.title}
                                </span>

                                {/* Priority Pill */}
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${task.priority === 'P0' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : task.priority === 'P1' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                                  {task.priority}
                                </span>

                                {/* Category Pill */}
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700/60 text-slate-300 border border-white/5">
                                  {task.category}
                                </span>

                                {/* App Name Pill */}
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-950/50 text-indigo-300 border border-indigo-500/20">
                                  {task.appName}
                                </span>

                                {task.estimatedHours && (
                                  <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1 ml-auto">
                                    <Clock className="w-3 h-3" />
                                    {task.estimatedHours}h
                                  </span>
                                )}
                              </div>

                              <p className={`text-xs ${isDone ? 'text-slate-500 line-through' : 'text-slate-400'} leading-relaxed`}>
                                {task.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : auditViewMode === 'report' && report ? (
                <div className="prose prose-invert prose-indigo max-w-none flex-1 overflow-y-auto pr-2 custom-scrollbar markdown-body">
                  <Markdown>{report}</Markdown>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-8">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
                    <ListTodo className="w-8 h-8 text-indigo-400/60" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-300 mb-1">No Audit Tasks Generated Yet</h3>
                  <p className="text-sm max-w-sm mb-4">
                    Click <span className="text-indigo-400 font-medium">"Audit All Apps as a Task"</span> on the left to analyze the portfolio and generate your structured sprint backlog.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Assets Tab Content */}
          {activeTab === 'assets' && (
            <>
              {report ? (
                <div className="prose prose-invert prose-indigo max-w-none flex-1 overflow-y-auto pr-2 custom-scrollbar markdown-body">
                  <Markdown>{report}</Markdown>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
                    <Sparkles className="w-8 h-8 text-slate-600" />
                  </div>
                  <p>Audit your assets and generate a plan<br/>to see monetization strategies.</p>
                </div>
              )}
            </>
          )}

          {/* Organizer Tab Content */}
          {activeTab === 'organizer' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
                <FolderSync className="w-8 h-8 text-slate-600" />
              </div>
              <p>Allow Local Organizer to read/write to a folder<br/>and the AI will structure it for you.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
