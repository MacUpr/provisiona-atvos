import React from 'react';
import { Zap, Clock, ShieldCheck, CopyCheck, ArrowUpRight, TrendingDown, CheckCircle2 } from 'lucide-react';

interface MetricsOverviewProps {
  touchlessRate?: number;
  timeReduction?: number;
  totalVolume?: string;
  duplicateCollisionsPrevented?: number;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  touchlessRate = 78.4,
  timeReduction = 52.0,
  totalVolume = 'R$ 14.850.000',
  duplicateCollisionsPrevented = 14,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Touchless Rate */}
      <div className="glass-panel p-4 rounded-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            Taxa Touchless (Auto-SAP)
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{touchlessRate}%</span>
          <span className="text-xs font-semibold text-emerald-400 flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            Meta: 70–80%
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${touchlessRate}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Lançamentos postados sem nenhuma intervenção humana
        </p>
      </div>

      {/* Card 2: Redução no Tempo de Fechamento */}
      <div className="glass-panel p-4 rounded-xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            Redução Tempo Fechamento
          </span>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">-{timeReduction}%</span>
          <span className="text-xs font-semibold text-blue-400 flex items-center">
            <TrendingDown className="w-3 h-3 mr-0.5" />
            Meta: 40–60%
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${timeReduction}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          De <span className="text-slate-300 font-medium">D-5</span> para <span className="text-emerald-400 font-semibold">D-1.8</span> no fechamento mensal
        </p>
      </div>

      {/* Card 3: Rastreabilidade Total CPC 25 */}
      <div className="glass-panel p-4 rounded-xl relative overflow-hidden group hover:border-teal-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            Rastreabilidade Contábil
          </span>
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-teal-400 font-mono">100%</span>
          <span className="text-xs font-semibold text-emerald-400 flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-0.5" />
            CPC 25 / IAS 37
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-teal-400 h-1.5 rounded-full w-full" />
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Trilha imutável com hash SHA-256 e alçadas digitais
        </p>
      </div>

      {/* Card 4: Idempotência & Bloqueio Duplicidades */}
      <div className="glass-panel p-4 rounded-xl relative overflow-hidden group hover:border-purple-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            Zero Duplicidades SAP
          </span>
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <CopyCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">0</span>
          <span className="text-xs font-semibold text-purple-400 flex items-center">
            {duplicateCollisionsPrevented} bloqueios ativos
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div className="bg-purple-500 h-1.5 rounded-full w-full" />
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Chave BKPF-XBLNR garante integridade de re-lançamento
        </p>
      </div>
    </div>
  );
};
