import React, { useState } from 'react';
import { MeddpiccAuditResult, MeddpiccPillarKey, PillarEvaluation } from '../types/meddpicc';
import { ShieldCheck, AlertTriangle, Zap, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Cpu, Globe } from 'lucide-react';

interface MeddpiccMatrixProps {
  auditResult: MeddpiccAuditResult;
  onApplyGapsToOutreach?: () => void;
}

const PILLAR_ORDER: MeddpiccPillarKey[] = [
  'metrics',
  'economicBuyer',
  'decisionCriteria',
  'decisionProcess',
  'paperProcess',
  'identifiedPain',
  'champion',
  'competition'
];

export const MeddpiccMatrix: React.FC<MeddpiccMatrixProps> = ({ auditResult, onApplyGapsToOutreach }) => {
  const [expandedPillar, setExpandedPillar] = useState<MeddpiccPillarKey | null>(null);

  const togglePillar = (key: MeddpiccPillarKey) => {
    setExpandedPillar(prev => (prev === key ? null : key));
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
      case 'B':
        return 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10';
      case 'C':
        return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
      default:
        return 'text-red-400 border-red-500/40 bg-red-500/10';
    }
  };

  const getStatusBadge = (status: PillarEvaluation['status']) => {
    switch (status) {
      case 'strong':
        return <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Strong</span>;
      case 'moderate':
        return <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Moderate</span>;
      case 'weak':
        return <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Weak</span>;
      case 'gap':
        return <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">Critical Gap</span>;
    }
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header with Composite Score and Engine Source */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">MEDDPICC Qualification Audit</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">{auditResult.qualificationStatus}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Engine Source Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium bg-slate-800/80 border-white/10">
            {auditResult.source === 'live_api' ? (
              <>
                <Globe className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300">Live API</span>
                <span className="text-slate-500 text-[11px]">({auditResult.modelUsed || 'Gemini 2.5'})</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300">Local Deterministic</span>
                <span className="text-slate-500 text-[11px]">(0ms Offline)</span>
              </>
            )}
          </div>

          {/* Grade Badge */}
          <div className={`px-3 py-1 rounded-lg border font-bold text-sm ${getGradeColor(auditResult.grade)}`}>
            Grade {auditResult.grade} • {auditResult.overallScore}/100
          </div>
        </div>
      </div>

      {/* Audit Summary & ROI Protection */}
      <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-center bg-slate-800/40 p-4 rounded-xl border border-white/5">
        <p className="text-xs text-slate-300 leading-relaxed">{auditResult.summary}</p>
        <div className="text-right sm:border-l sm:border-white/10 sm:pl-4">
          <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Protected ROI</p>
          <p className="text-base font-bold text-emerald-400">+${auditResult.estimatedRoi.toLocaleString()}</p>
        </div>
      </div>

      {/* Critical Single-Point Failures (If any) */}
      {auditResult.singlePointFailures && auditResult.singlePointFailures.length > 0 && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Critical Single-Point Failures Detected:</span>
          </div>
          <ul className="space-y-1.5 pl-6 list-disc text-xs text-red-200/90">
            {auditResult.singlePointFailures.map((failure, idx) => (
              <li key={idx}>{failure}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 8-Pillar Interactive Matrix */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pb-1 text-xs text-slate-400">
          <span>Pillars (M, E, D, D, P, I, C, C)</span>
          <span className="text-[11px] text-slate-500">Click any pillar to view surgical action</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {PILLAR_ORDER.map(key => {
            const pillar = auditResult.pillars[key];
            if (!pillar) return null;
            const isExpanded = expandedPillar === key;

            return (
              <div
                key={key}
                onClick={() => togglePillar(key)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  pillar.gap
                    ? 'bg-red-950/20 border-red-500/20 hover:border-red-500/40'
                    : isExpanded
                    ? 'bg-slate-800/80 border-indigo-500/40'
                    : 'bg-slate-800/40 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center font-bold text-xs text-indigo-400 shrink-0">
                      {pillar.shortCode}
                    </span>
                    <span className="text-xs font-medium text-white truncate">{pillar.name}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {getStatusBadge(pillar.status)}
                    <span className="text-xs font-semibold text-slate-300 w-8 text-right">{pillar.score}%</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Score bar */}
                <div className="w-full bg-slate-950/60 rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pillar.score >= 75
                        ? 'bg-emerald-400'
                        : pillar.score >= 60
                        ? 'bg-indigo-400'
                        : pillar.score >= 40
                        ? 'bg-amber-400'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${pillar.score}%` }}
                  />
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Finding:</span>{' '}
                      <span className="text-slate-200">{pillar.finding}</span>
                    </div>
                    <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-200">
                      <span className="font-semibold text-indigo-300">Surgical Recommendation:</span>{' '}
                      {pillar.recommendation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      {onApplyGapsToOutreach && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onApplyGapsToOutreach}
            className="flex items-center gap-2 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 px-4 py-2 rounded-xl transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Apply Gap Analysis to Outreach Generator
          </button>
        </div>
      )}
    </div>
  );
};
