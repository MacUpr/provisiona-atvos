import React from 'react';
import {
  Activity,
  Server,
  Database,
  Cpu,
  Layers,
  TrendingUp,
  BarChart3,
  Lock,
  Zap,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ATVOS_COMPANIES } from '../services/masterDataStore';

interface CockpitTelemetryProps {
  touchlessCount: number;
  exceptionCount: number;
  totalPostedSap: number;
  totalReversals: number;
  duplicateBlockedCount: number;
}

export const CockpitTelemetry: React.FC<CockpitTelemetryProps> = ({
  touchlessCount = 38,
  exceptionCount = 2,
  totalPostedSap = 46,
  totalReversals = 12,
  duplicateBlockedCount = 14,
}) => {
  const unitsData = [
    { name: 'Unidade Santa Luzia (MS)', code: '1100', volume: 'R$ 4.250.000', touchless: 86, status: 'Fechamento D-1' },
    { name: 'Unidade Eldorado (MS)', code: '1200', volume: 'R$ 3.890.000', touchless: 74, status: 'Fechamento D-1' },
    { name: 'Unidade Costa Rica (MS)', code: '1300', volume: 'R$ 2.410.000', touchless: 78, status: 'Fechamento D-2' },
    { name: 'Unidade Alto Taquari (MT)', code: '1400', volume: 'R$ 2.150.000', touchless: 71, status: 'Fechamento D-2' },
    { name: 'Unidade Conquista do Pontal (SP)', code: '1500', volume: 'R$ 1.950.000', touchless: 82, status: 'Fechamento D-1' },
    { name: 'Unidade Teodoro Sampaio (SP)', code: '1600', volume: 'R$ 1.200.000', touchless: 80, status: 'Fechamento D-1' },
  ];

  return (
    <div className="space-y-4">
      {/* Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* System Health */}
        <div className="glass-panel p-5 rounded-xl border border-brand-border">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Conectividade SAP S/4HANA
              </h3>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="mt-3 space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-slate-900">
              <span className="text-slate-400">Protocolo:</span>
              <span className="text-emerald-400 font-bold">RFC / BAPI & OData</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-900">
              <span className="text-slate-400">Latência Média:</span>
              <span className="text-emerald-400 font-bold">18 ms</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-900">
              <span className="text-slate-400">Idempotency Guard Hits:</span>
              <span className="text-purple-400 font-bold">{duplicateBlockedCount} colisões bloqueadas</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-900">
              <span className="text-slate-400">BAPI_ACC_DOCUMENT_POST:</span>
              <span className="text-white font-bold">100% Disponível</span>
            </div>
          </div>
        </div>

        {/* Closing Cycle Reduction Comparison */}
        <div className="glass-panel p-5 rounded-xl border border-brand-border">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Evolução do Fechamento Mensal
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
              -54% Tempo
            </span>
          </div>

          <div className="mt-3 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Fluxo Manual Anterior:</span>
                <span className="text-rose-400 font-bold font-mono">D-5.0 dias</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Com Esteira PROVISIONA:</span>
                <span className="text-emerald-400 font-bold font-mono">D-1.8 dias</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full w-[36%]" />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 bg-slate-900 p-2 rounded border border-slate-800">
              💡 <strong>Ganho:</strong> Os analistas de controladoria deixam de conferir documentos e dedicam o fechamento à análise gerencial de margens e custos agrícolas.
            </p>
          </div>
        </div>

        {/* Active Learning & Model Realimentation */}
        <div className="glass-panel p-5 rounded-xl border border-brand-border">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Realimentação de IA (HITL)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-teal-400 bg-teal-500/20 px-2 py-0.5 rounded">
              Ativo
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Padrões Aprendidos:</span>
                <span className="text-white font-mono font-bold">142 regras</span>
              </div>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Taxa Touchless Inicial:</span>
                <span className="text-slate-300 font-mono">61%</span>
              </div>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Taxa Touchless Atual:</span>
                <span className="text-emerald-400 font-mono font-bold">78.4% (+17.4%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Units Breakdown */}
      <div className="glass-panel p-5 rounded-xl border border-brand-border">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Volume de Provisões por Unidade Produtiva Atvos
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Exercício 2026 · Safra 26/27</span>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                <th className="py-2 px-2">Unidade / Polo</th>
                <th className="py-2 px-2">Empresa SAP</th>
                <th className="py-2 px-2">Volume Provisionado</th>
                <th className="py-2 px-2">Taxa Touchless</th>
                <th className="py-2 px-2 text-right">Status do Fechamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {unitsData.map((u) => (
                <tr key={u.code} className="hover:bg-slate-900/60">
                  <td className="py-2.5 px-2 font-sans font-bold text-white">{u.name}</td>
                  <td className="py-2.5 px-2 text-slate-400">{u.code}</td>
                  <td className="py-2.5 px-2 text-emerald-400 font-bold">{u.volume}</td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${u.touchless}%` }}
                        />
                      </div>
                      <span className="text-slate-300 font-bold">{u.touchless}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
