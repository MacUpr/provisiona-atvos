import React, { useState } from 'react';
import { ProvisionRecord } from '../types/provision';
import {
  AlertOctagon,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  X,
  Database,
  Tag,
  Hash,
  BrainCircuit,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { SAP_COST_CENTERS_DB, SAP_GL_ACCOUNTS_DB } from '../services/masterDataStore';

interface ExceptionQueueProps {
  exceptions: ProvisionRecord[];
  onClose: () => void;
  onResolveException: (
    provision: ProvisionRecord,
    corrections: {
      costCenter?: string;
      glAccount?: string;
      grossAmount?: number;
      vendorCnpj?: string;
    },
    justification: string
  ) => void;
}

export const ExceptionQueue: React.FC<ExceptionQueueProps> = ({
  exceptions,
  onClose,
  onResolveException,
}) => {
  const [selectedProvision, setSelectedProvision] = useState<ProvisionRecord | null>(
    exceptions[0] || null
  );

  const [costCenterInput, setCostCenterInput] = useState(
    selectedProvision?.costCenter.value === 'CC-1300-LOG03' ? 'CC-1300-LOG04' : selectedProvision?.costCenter.value || ''
  );
  const [glAccountInput, setGlAccountInput] = useState(selectedProvision?.glAccount.value || '');
  const [amountInput, setAmountInput] = useState(selectedProvision?.grossAmount.value.toString() || '');
  const [justification, setJustification] = useState(
    'Ajustado centro de custo para a nova estrutura ativa do SAP após conferência da medição.'
  );

  // Sync inputs when selected exception changes
  const handleSelectException = (prov: ProvisionRecord) => {
    setSelectedProvision(prov);
    setCostCenterInput(prov.costCenter.value === 'CC-1300-LOG03' ? 'CC-1300-LOG04' : prov.costCenter.value);
    setGlAccountInput(prov.glAccount.value);
    setAmountInput(prov.grossAmount.value.toString());
  };

  const handleResolve = () => {
    if (!selectedProvision) return;

    onResolveException(
      selectedProvision,
      {
        costCenter: costCenterInput,
        glAccount: glAccountInput,
        grossAmount: parseFloat(amountInput) || selectedProvision.grossAmount.value,
      },
      justification
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-brand-border flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">Fila de Exceções & Triage Inteligente (HITL)</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {exceptions.length} {exceptions.length === 1 ? 'pendência' : 'pendências'}
                </span>
              </div>
              <p className="text-xs text-brand-muted">
                Human-in-the-Loop: Trate inconsistências de dados mestres e realimente a base de aprendizado.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {exceptions.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Fila de Exceções Vazia!</h3>
            <p className="text-xs text-brand-muted mt-1 max-w-sm mx-auto">
              Todas as provisões estão válidas, aprovadas ou lançadas com sucesso no SAP.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
            {/* Left Column: Exception List (4 cols) */}
            <div className="md:col-span-4 border-r border-brand-border p-3 overflow-y-auto space-y-2 bg-slate-950/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 block">
                Itens com Bloqueio ou Baixa Confiança
              </span>

              {exceptions.map((prov) => {
                const isSelected = selectedProvision?.id === prov.id;
                const hasFailed = prov.validationResults.some((r) => r.status === 'FAILED');

                return (
                  <button
                    key={prov.id}
                    onClick={() => handleSelectException(prov)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-brand-surfaceLight border-amber-500 ring-1 ring-amber-500/30'
                        : 'bg-brand-surface/40 border-brand-border/60 hover:bg-brand-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-300">
                        {prov.referenceNumber}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          hasFailed
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {hasFailed ? 'Dados Mestres SAP' : 'Score < 90%'}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white line-clamp-1">
                      {prov.documentTitle}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {prov.businessUnit.name}
                    </div>
                    <div className="mt-2 text-xs font-mono text-emerald-400 font-bold">
                      R$ {prov.grossAmount.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Resolution Workspace (8 cols) */}
            {selectedProvision && (
              <div className="md:col-span-8 p-4 sm:p-5 overflow-y-auto space-y-4">
                {/* Diagnostic Alert Box */}
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">
                        Diagnóstico do Motor de Validação
                      </h4>
                      <p className="text-xs text-amber-200 mt-0.5">
                        {selectedProvision.validationResults.find((r) => r.status === 'FAILED')?.message ||
                          `Score de confiança OCR em ${Math.round(selectedProvision.overallConfidence * 100)}% (abaixo do limiar touchless de 90%).`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Correction Fields */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Retificação de Parâmetros Contábeis
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Cost Center */}
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                        Centro de Custo (SAP CSKS)
                      </label>
                      <select
                        value={costCenterInput}
                        onChange={(e) => setCostCenterInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      >
                        {SAP_COST_CENTERS_DB.map((cc) => (
                          <option
                            key={cc.kostl}
                            value={cc.kostl}
                            disabled={!cc.isActive}
                            className={!cc.isActive ? 'text-rose-400' : 'text-slate-200'}
                          >
                            {cc.kostl} - {cc.ktext} {!cc.isActive ? '(INATIVO SAP)' : ''}
                          </option>
                        ))}
                      </select>
                      {selectedProvision.costCenter.value === 'CC-1300-LOG03' && (
                        <p className="text-[10px] text-emerald-400 mt-1 flex items-center">
                          <Sparkles className="w-3 h-3 mr-1" /> Sugestão automática da IA: Centro ativo CC-1300-LOG04
                        </p>
                      )}
                    </div>

                    {/* G/L Account */}
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                        Conta Contábil Razão (SAP SKA1)
                      </label>
                      <select
                        value={glAccountInput}
                        onChange={(e) => setGlAccountInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      >
                        {SAP_GL_ACCOUNTS_DB.filter((gl) => gl.accountType === 'EXPENSE').map((gl) => (
                          <option key={gl.saknr} value={gl.saknr}>
                            {gl.saknr} - {gl.txt50}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Gross Amount */}
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                        Valor Bruto (R$)
                      </label>
                      <input
                        type="number"
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    {/* Vendor CNPJ */}
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                        CNPJ Fornecedor Validado
                      </label>
                      <input
                        type="text"
                        disabled
                        value={selectedProvision.vendorCnpj.value}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 font-mono"
                      />
                    </div>
                  </div>

                  {/* Justification & Active Learning Feedback */}
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                      Justificativa Técnica para Auditoria & Realimentação de Modelo
                    </label>
                    <textarea
                      rows={2}
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Footer Submit Button */}
                <div className="pt-3 border-t border-brand-border flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>Realimentação ativa: o modelo aprende com este ajuste para lançamentos futuros.</span>
                  </div>

                  <button
                    onClick={handleResolve}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-glow-green flex items-center space-x-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Salvar, Validar & Realimentar Modelo</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
