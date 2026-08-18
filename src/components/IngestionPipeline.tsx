import React from 'react';
import { ProvisionRecord } from '../types/provision';
import {
  FileText,
  Cpu,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Zap,
  Play,
  Copy,
  RotateCcw,
  Sparkles,
  Lock,
} from 'lucide-react';

interface IngestionPipelineProps {
  provision: ProvisionRecord;
  currentStep: number; // 1, 2, 3, 4
  isProcessing: boolean;
  onAdvanceLayer: () => void;
  onProcessAllTouchless: () => void;
  onTestIdempotency: () => void;
  onExecuteReversal: () => void;
}

export const IngestionPipeline: React.FC<IngestionPipelineProps> = ({
  provision,
  currentStep,
  isProcessing,
  onAdvanceLayer,
  onProcessAllTouchless,
  onTestIdempotency,
  onExecuteReversal,
}) => {
  const steps = [
    {
      stepNumber: 1,
      name: '1 · Captura Inteligente',
      subtitle: 'Classificação, OCR & Score',
      elimina: 'Elimina: Digitação manual',
      icon: FileText,
      status: currentStep >= 1 ? 'completed' : 'pending',
    },
    {
      stepNumber: 2,
      name: '2 · Motor de Validação',
      subtitle: 'Dados Mestres SAP & CPC 25',
      elimina: 'Elimina: Conferência etapa a etapa',
      icon: Cpu,
      status:
        currentStep > 2
          ? 'completed'
          : currentStep === 2
          ? provision.validationResults.some((r) => r.status === 'FAILED')
            ? 'failed'
            : provision.validationResults.some((r) => r.status === 'WARNING')
            ? 'warning'
            : 'active'
          : 'pending',
    },
    {
      stepNumber: 3,
      name: '3 · Workflow + Trilha',
      subtitle: 'Alçadas & Hash SHA-256',
      elimina: 'Elimina: Caça a e-mails e histórico',
      icon: GitPullRequest,
      status:
        currentStep > 3
          ? 'completed'
          : currentStep === 3
          ? provision.status === 'APPROVED' || provision.status === 'VALIDATED'
            ? 'active'
            : provision.status === 'PENDING_APPROVAL'
            ? 'warning'
            : 'active'
          : 'pending',
    },
    {
      stepNumber: 4,
      name: '4 · Integração SAP',
      subtitle: 'Lançamento Idempotente & Reversão',
      elimina: 'Elimina: Re-lançamento manual',
      icon: CheckCircle2,
      status:
        provision.status === 'POSTED_SAP' || provision.status === 'REVERSED_SAP'
          ? 'completed'
          : currentStep === 4
          ? 'active'
          : 'pending',
    },
  ];

  return (
    <div className="glass-panel p-5 rounded-xl border border-brand-border shadow-card-dark">
      {/* Header with Title & Action Triggers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-brand-border/60">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {provision.businessUnit.code} · {provision.referenceNumber}
            </span>
            <h1 className="text-base font-bold text-white">
              {provision.documentTitle}
            </h1>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Fornecedor: <strong className="text-slate-200">{provision.vendor.value}</strong> ({provision.vendorCnpj.value}) · Valor: <strong className="text-emerald-400 font-mono">R$ {provision.grossAmount.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Touchless Run Button */}
          {provision.status !== 'POSTED_SAP' && provision.status !== 'REVERSED_SAP' && (
            <button
              onClick={onProcessAllTouchless}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-glow-green flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isProcessing ? 'Processando...' : 'Processar Tudo (Touchless)'}</span>
            </button>
          )}

          {/* Advance Single Step Button */}
          {currentStep < 4 && provision.status !== 'POSTED_SAP' && (
            <button
              onClick={onAdvanceLayer}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow-blue flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Avançar Camada {currentStep + 1}</span>
            </button>
          )}

          {/* Test Idempotency (Available once posted to SAP) */}
          {provision.status === 'POSTED_SAP' && (
            <>
              <button
                onClick={onTestIdempotency}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all"
                title="Tentar enviar o mesmo lançamento novamente para validar bloqueio anti-duplicidade"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Testar Colisão de Idempotência</span>
              </button>

              <button
                onClick={onExecuteReversal}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                title="Executar reversão contábil automática no SAP (FB08)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reversão Contábil FB08</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4-Layer Stepper Graphics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCurrent = currentStep === step.stepNumber;
          const isDone = step.status === 'completed';
          const isWarn = step.status === 'warning';
          const isFail = step.status === 'failed';

          return (
            <div
              key={step.stepNumber}
              className={`p-3.5 rounded-xl border transition-all relative overflow-hidden ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                  : isFail
                  ? 'bg-rose-950/20 border-rose-500/50 text-white'
                  : isWarn
                  ? 'bg-amber-950/20 border-amber-500/50 text-white'
                  : isCurrent
                  ? 'bg-brand-surfaceLight border-blue-500 shadow-glow-blue'
                  : 'bg-brand-surface/40 border-brand-border/60 text-slate-400 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isFail
                      ? 'bg-rose-500 text-white'
                      : isWarn
                      ? 'bg-amber-500 text-black'
                      : isCurrent
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : isFail ? <XCircle className="w-4 h-4" /> : step.stepNumber}
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : isFail
                      ? 'bg-rose-500/20 text-rose-300'
                      : isWarn
                      ? 'bg-amber-500/20 text-amber-300'
                      : isCurrent
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? 'Concluído' : isFail ? 'Inconsistência' : isWarn ? 'Alçada / Alerta' : isCurrent ? 'Em Execução' : 'Aguardando'}
                </span>
              </div>

              <h4 className="text-xs font-bold text-white mt-2">
                {step.name}
              </h4>
              <p className="text-[11px] text-slate-300">
                {step.subtitle}
              </p>
              <p className="text-[10px] text-brand-muted mt-2 font-mono italic">
                {step.elimina}
              </p>

              {/* Step indicator bar */}
              <div className="mt-3 w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                <div
                  className={`h-1 rounded-full ${
                    isDone ? 'bg-emerald-400 w-full' : isFail ? 'bg-rose-500 w-full' : isWarn ? 'bg-amber-400 w-full' : isCurrent ? 'bg-blue-400 w-1/2 animate-pulse' : 'w-0'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
