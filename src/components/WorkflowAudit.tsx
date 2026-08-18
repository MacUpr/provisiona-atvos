import React, { useState } from 'react';
import { ProvisionRecord, ApprovalTier } from '../types/provision';
import { GitPullRequest, ShieldCheck, CheckCircle2, XCircle, UserCheck, Clock, Hash, Lock, Send, MessageSquare } from 'lucide-react';

interface WorkflowAuditProps {
  provision: ProvisionRecord;
  onApprove: (approverName: string, tier: ApprovalTier, comment?: string) => void;
  onReject: (rejecterName: string, reason: string) => void;
}

export const WorkflowAudit: React.FC<WorkflowAuditProps> = ({
  provision,
  onApprove,
  onReject,
}) => {
  const [approverName, setApproverName] = useState('Eng. Roberto Silveira (Diretoria)');
  const [approvalComment, setApprovalComment] = useState('Aprovado tecnicamente conforme medição de entressafra e contrato vigente.');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  const getTierLabel = (tier: ApprovalTier) => {
    switch (tier) {
      case 'TOUCHLESS_AUTO':
        return 'Touchless Automático (Alçada do Sistema)';
      case 'COST_CENTER_MANAGER':
        return 'Gestor de Centro de Custo (Até R$ 200k)';
      case 'CONTROLLER_MANAGER':
        return 'Gerência de Controladoria (R$ 200k - R$ 400k)';
      case 'FINANCIAL_DIRECTOR':
        return 'Diretoria Financeira / Industrial (> R$ 400k)';
    }
  };

  const isPendingApproval = provision.status === 'PENDING_APPROVAL' || (provision.requiredApprovalTier !== 'TOUCHLESS_AUTO' && provision.status !== 'APPROVED' && provision.status !== 'POSTED_SAP' && provision.status !== 'REVERSED_SAP');

  return (
    <div className="glass-panel p-5 rounded-xl border border-brand-border shadow-card-dark">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-brand-border/60">
        <div>
          <div className="flex items-center space-x-2">
            <GitPullRequest className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Camada 3 · Workflow de Alçadas & Trilha de Auditoria Imutável
            </h3>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Governança corporativa com encadeamento criptográfico SHA-256 e registro em tempo real de cada aprovação.
          </p>
        </div>

        {/* Cryptographic Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-[11px]">Trilha SHA-256 Íntegra (100% CPC 25)</span>
        </div>
      </div>

      {/* Governance & Approval Card (if approval needed) */}
      {isPendingApproval && provision.status !== 'REJECTED' && (
        <div className="mt-4 p-4 rounded-xl bg-blue-950/30 border border-blue-500/40">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-blue-400" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Alçada Exigida: {getTierLabel(provision.requiredApprovalTier)}
                </h4>
                <p className="text-[11px] text-blue-200">
                  O valor de <strong className="text-white font-mono">R$ {provision.grossAmount.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> requer assinatura formal antes do envio ao SAP.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Aguardando Assinatura
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Nome do Aprovador / Cargo
              </label>
              <input
                type="text"
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Parecer / Justificativa de Alçada
              </label>
              <input
                type="text"
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end space-x-2 pt-2 border-t border-blue-900/50">
            <button
              onClick={() => setShowRejectBox(!showRejectBox)}
              className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 transition-all"
            >
              Rejeitar Provisão
            </button>
            <button
              onClick={() => onApprove(approverName, provision.requiredApprovalTier, approvalComment)}
              className="px-4 py-1.5 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-green flex items-center space-x-1.5 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Assinar & Liberar para SAP</span>
            </button>
          </div>

          {showRejectBox && (
            <div className="mt-3 p-3 rounded bg-slate-900 border border-rose-500/40">
              <label className="text-[10px] text-rose-300 uppercase font-bold block mb-1">
                Motivo da Reprovação
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: Medição física não condizente com a medição de campo..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs text-white"
                />
                <button
                  onClick={() => onReject('Auditoria Interna', rejectReason || 'Inconsistência técnica')}
                  className="px-3 py-1.5 text-xs font-bold rounded bg-rose-600 hover:bg-rose-500 text-white"
                >
                  Confirmar Reprovação
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audit Trail Timeline */}
      <div className="mt-4">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Trilha de Eventos & Hashes Criptográficos
        </h4>

        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
          {provision.auditTrail.map((entry, idx) => (
            <div key={entry.id} className="relative flex items-start space-x-3 pl-1">
              <div className="w-6 h-6 rounded-full bg-slate-900 border border-emerald-500 text-emerald-400 flex items-center justify-center text-[10px] font-mono font-bold z-10">
                {idx + 1}
              </div>

              <div className="flex-1 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{entry.action}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {entry.layer}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(entry.timestamp).toLocaleTimeString()} · {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-slate-300 mt-1">
                  {entry.details}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] font-mono text-slate-500">
                  <div className="flex items-center space-x-1 truncate max-w-sm">
                    <Hash className="w-3 h-3 text-slate-600" />
                    <span>Hash: <span className="text-emerald-400/80">{entry.currentHash.substring(0, 16)}...</span></span>
                  </div>
                  <span>Ator: <strong className="text-slate-300">{entry.actor}</strong> ({entry.actorRole})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
