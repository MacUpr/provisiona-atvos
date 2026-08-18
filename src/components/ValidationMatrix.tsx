import React from 'react';
import { ProvisionRecord, ValidationRuleResult } from '../types/provision';
import { Cpu, CheckCircle2, AlertTriangle, XCircle, Database, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

interface ValidationMatrixProps {
  provision: ProvisionRecord;
  onOpenExceptionQueue?: () => void;
}

export const ValidationMatrix: React.FC<ValidationMatrixProps> = ({
  provision,
  onOpenExceptionQueue,
}) => {
  const hasFailedRules = provision.validationResults.some((r) => r.status === 'FAILED');
  const hasWarningRules = provision.validationResults.some((r) => r.status === 'WARNING');

  return (
    <div className="glass-panel p-5 rounded-xl border border-brand-border shadow-card-dark">
      {/* Header with Pitch Key Quote */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-brand-border/60">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Camada 2 · Motor de Validação de Regras Contábeis & SAP
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              80% do Valor da Solução
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Confronta cada provisão extraída contra as tabelas mestres do SAP e regras do CPC 25 antes de permitir o lançamento.
          </p>
        </div>

        {/* Status Badge */}
        <div>
          {hasFailedRules ? (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Inconsistência Bloqueante Encontrada</span>
            </div>
          ) : hasWarningRules ? (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Alerta de Alçada / Competência</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% dos Dados Mestres e Regras Validados</span>
            </div>
          )}
        </div>
      </div>

      {/* Rules Table */}
      <div className="mt-4 space-y-2.5">
        {provision.validationResults.map((rule) => {
          const isPassed = rule.status === 'PASSED';
          const isWarning = rule.status === 'WARNING';
          const isFailed = rule.status === 'FAILED';

          return (
            <div
              key={rule.ruleId}
              className={`p-3 rounded-lg border transition-all ${
                isPassed
                  ? 'bg-slate-900/50 border-slate-800'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'bg-rose-950/20 border-rose-500/40 ring-1 ring-rose-500/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    {isFailed && <XCircle className="w-4 h-4 text-rose-400" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{rule.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700">
                        {rule.ruleId}
                      </span>
                      {rule.sapTableRef && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-950/60 text-blue-300 rounded border border-blue-800/60">
                          {rule.sapTableRef}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${isPassed ? 'text-slate-300' : isWarning ? 'text-amber-200' : 'text-rose-200 font-medium'}`}>
                      {rule.message}
                    </p>
                    {rule.details && (
                      <p className="text-[11px] text-slate-400 mt-1 font-mono italic">
                        {rule.details}
                      </p>
                    )}
                  </div>
                </div>

                <div className="self-end sm:self-center flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isPassed
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {isPassed ? 'VALIDADO' : isWarning ? 'ALERTA' : 'INCONSISTENTE'}
                  </span>

                  {isFailed && onOpenExceptionQueue && (
                    <button
                      onClick={onOpenExceptionQueue}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded bg-rose-600 hover:bg-rose-500 text-white flex items-center space-x-1 transition-all"
                    >
                      <span>Corrigir</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="mt-4 p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Tabelas SAP Consultadas: <strong className="text-white font-mono">LFA1</strong> (Fornecedores), <strong className="text-white font-mono">CSKS</strong> (Centros de Custo), <strong className="text-white font-mono">SKA1</strong> (Contas Razão), <strong className="text-white font-mono">OB52</strong> (Períodos).</span>
        </div>
        <span className="text-emerald-400 font-medium text-[11px]">
          Tempo de Execução do Motor: 14ms
        </span>
      </div>
    </div>
  );
};
