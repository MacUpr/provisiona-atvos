import React, { useState, useEffect } from 'react';
import { ProvisionRecord, ApprovalTier } from './types/provision';
import { DEMO_SCENARIOS, DemoScenario } from './data/mockScenarios';
import { ValidationEngineService } from './services/validationEngine';
import { WorkflowService } from './services/workflowService';
import { SapConnectorService } from './services/sapConnector';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { ScenarioSelector } from './components/ScenarioSelector';
import { IngestionPipeline } from './components/IngestionPipeline';
import { DocumentViewer } from './components/DocumentViewer';
import { ValidationMatrix } from './components/ValidationMatrix';
import { WorkflowAudit } from './components/WorkflowAudit';
import { SapPostingInspector } from './components/SapPostingInspector';
import { ExceptionQueue } from './components/ExceptionQueue';
import { Cpc25Inspector } from './components/Cpc25Inspector';
import { MasterDataModal } from './components/MasterDataModal';
import { NewProvisionModal } from './components/NewProvisionModal';
import { CockpitTelemetry } from './components/CockpitTelemetry';
import {
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  Layers,
  Zap,
  RotateCcw,
  X,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';

interface ToastNotification {
  id: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING';
  title: string;
  message: string;
}

export function App() {
  // Estado Principal
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(DEMO_SCENARIOS[0].id);
  const [currentProvision, setCurrentProvision] = useState<ProvisionRecord>(DEMO_SCENARIOS[0].provision);
  const [currentLayerStep, setCurrentLayerStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('pipeline');

  // Modais
  const [isMasterDataOpen, setIsMasterDataOpen] = useState<boolean>(false);
  const [isExceptionQueueOpen, setIsExceptionQueueOpen] = useState<boolean>(false);
  const [isNewProvisionOpen, setIsNewProvisionOpen] = useState<boolean>(false);

  // Lista de Exceções & Telemetria
  const [exceptionsList, setExceptionsList] = useState<ProvisionRecord[]>([DEMO_SCENARIOS[2].provision, DEMO_SCENARIOS[3].provision]);
  const [duplicateBlockedCount, setDuplicateBlockedCount] = useState<number>(14);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Toast Helper
  const addToast = (type: ToastNotification['type'], title: string, message: string) => {
    const newToast: ToastNotification = {
      id: `TOAST-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 6000);
  };

  // Carrega o cenário selecionado
  const handleSelectScenario = (scenario: DemoScenario) => {
    setSelectedScenarioId(scenario.id);
    setCurrentProvision(JSON.parse(JSON.stringify(scenario.provision)));
    setCurrentLayerStep(1);
    addToast('INFO', 'Cenário Carregado', `${scenario.title} (${scenario.badge}) carregado na esteira.`);
  };

  // Reseta estado para o início
  const handleReset = () => {
    const defaultScenario = DEMO_SCENARIOS.find((s) => s.id === selectedScenarioId) || DEMO_SCENARIOS[0];
    setCurrentProvision(JSON.parse(JSON.stringify(defaultScenario.provision)));
    setCurrentLayerStep(1);
    addToast('INFO', 'Esteira Reiniciada', 'O documento retornou à Camada 1 (Captura Inteligente).');
  };

  // Avança uma única camada
  const handleAdvanceLayer = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (currentLayerStep === 1) {
        // Camada 1 -> Camada 2: Executar Motor de Validação
        const validationOutput = ValidationEngineService.runValidation(currentProvision);
        const updatedProv: ProvisionRecord = {
          ...currentProvision,
          validationResults: validationOutput.ruleResults,
          cpc25: validationOutput.cpc25,
          requiredApprovalTier: validationOutput.requiredTier,
          costCenterName: validationOutput.costCenterName || currentProvision.costCenterName,
          glAccountName: validationOutput.glAccountName || currentProvision.glAccountName,
          status: validationOutput.isValid ? 'VALIDATED' : 'EXCEPTION_QUEUE',
        };

        const auditEntry = await WorkflowService.appendAuditEntry(updatedProv, {
          actor: 'Motor de Validação (Camada 2)',
          actorRole: 'Contabilidade & SAP Rules Engine',
          action: 'EXECUÇÃO DE REGRAS CONTÁBEIS & DADOS MESTRES',
          layer: 'CAMADA_2_VALIDACAO',
          details: `Avaliação concluída. ${validationOutput.ruleResults.filter((r) => r.status === 'PASSED').length} regras aprovadas, ${validationOutput.ruleResults.filter((r) => r.status === 'FAILED').length} falhas.`,
          isAutomated: true,
        });

        updatedProv.auditTrail = [...updatedProv.auditTrail, auditEntry];
        setCurrentProvision(updatedProv);
        setCurrentLayerStep(2);

        if (!validationOutput.isValid) {
          addToast('WARNING', 'Inconsistência Detectada', 'O motor bloqueou o avanço devido a inconsistência de dados mestres SAP.');
          if (!exceptionsList.some((e) => e.id === updatedProv.id)) {
            setExceptionsList((prev) => [...prev, updatedProv]);
          }
        } else {
          addToast('SUCCESS', 'Camada 2 Validada', 'Todos os dados mestres SAP e regras do CPC 25 foram homologados.');
        }
      } else if (currentLayerStep === 2) {
        // Camada 2 -> Camada 3: Workflow & Alçadas
        if (currentProvision.requiredApprovalTier === 'TOUCHLESS_AUTO') {
          const autoApprovedProv: ProvisionRecord = {
            ...currentProvision,
            status: 'APPROVED',
            approvalStatus: {
              tier: 'TOUCHLESS_AUTO',
              approverName: 'Sistema Provisiona (Auto Touchless)',
              approvedAt: new Date().toISOString(),
              comments: 'Aprovado automaticamente conforme alçada de governança Atvos.',
            },
          };

          const auditEntry = await WorkflowService.appendAuditEntry(autoApprovedProv, {
            actor: 'Workflow de Alçadas (Camada 3)',
            actorRole: 'Governance Engine',
            action: 'APROVAÇÃO TOUCHLESS AUTOMÁTICA',
            layer: 'CAMADA_3_WORKFLOW',
            details: 'Elegível para lançamento direto no SAP sem toque humano.',
            isAutomated: true,
          });

          autoApprovedProv.auditTrail = [...autoApprovedProv.auditTrail, auditEntry];
          setCurrentProvision(autoApprovedProv);
          setCurrentLayerStep(3);
          addToast('SUCCESS', 'Camada 3 Concluída', 'Alçada automática validada. Liberado para integração SAP.');
        } else {
          const pendingProv: ProvisionRecord = {
            ...currentProvision,
            status: 'PENDING_APPROVAL',
          };
          setCurrentProvision(pendingProv);
          setCurrentLayerStep(3);
          addToast('WARNING', 'Alçada Exigida', `Esta provisão de R$ ${currentProvision.grossAmount.value.toLocaleString('pt-BR')} requer aprovação formal antes do SAP.`);
        }
      } else if (currentLayerStep === 3) {
        // Camada 3 -> Camada 4: Lançamento Idempotente no SAP
        const sapResult = await SapConnectorService.postAccountingDocument(currentProvision);
        if (sapResult.status === 'SUCCESS') {
          const postedProv: ProvisionRecord = {
            ...currentProvision,
            status: 'POSTED_SAP',
            sapResult,
          };

          const auditEntry = await WorkflowService.appendAuditEntry(postedProv, {
            actor: 'Conector SAP S/4HANA (Camada 4)',
            actorRole: 'ERP Integration Suite',
            action: `LANÇAMENTO SAP EFETUADO (BELNR ${sapResult.belnr})`,
            layer: 'CAMADA_4_SAP',
            details: `Documento gravado no SAP. Chave de idempotência: ${sapResult.idempotencyHash}.`,
            isAutomated: true,
          });

          postedProv.auditTrail = [...postedProv.auditTrail, auditEntry];
          setCurrentProvision(postedProv);
          setCurrentLayerStep(4);
          addToast('SUCCESS', 'Documento SAP Gravado!', `BELNR ${sapResult.belnr} gerado com sucesso no S/4HANA.`);
        } else {
          addToast('ERROR', 'Erro no Lançamento SAP', sapResult.message);
        }
      }
    } catch (err: any) {
      addToast('ERROR', 'Erro na Execução', err.message || 'Falha ao processar camada');
    } finally {
      setIsProcessing(false);
    }
  };

  // Executa todas as 4 camadas em modo Touchless
  const handleProcessAllTouchless = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      addToast('INFO', 'Iniciando Esteira Touchless', 'Executando as 4 camadas automatizadas...');

      // 1. Camada 2: Validação
      const val = ValidationEngineService.runValidation(currentProvision);
      let prov: ProvisionRecord = {
        ...currentProvision,
        validationResults: val.ruleResults,
        cpc25: val.cpc25,
        requiredApprovalTier: val.requiredTier,
        costCenterName: val.costCenterName || currentProvision.costCenterName,
        glAccountName: val.glAccountName || currentProvision.glAccountName,
        status: val.isValid ? 'VALIDATED' : 'EXCEPTION_QUEUE',
      };

      const auditVal = await WorkflowService.appendAuditEntry(prov, {
        actor: 'Motor de Validação (Camada 2)',
        actorRole: 'Rules Engine',
        action: 'EXECUÇÃO DE REGRAS CONTÁBEIS & DADOS MESTRES',
        layer: 'CAMADA_2_VALIDACAO',
        details: 'Execução touchless de regras de negócio.',
        isAutomated: true,
      });
      prov.auditTrail = [...prov.auditTrail, auditVal];

      if (!val.isValid) {
        setCurrentProvision(prov);
        setCurrentLayerStep(2);
        if (!exceptionsList.some((e) => e.id === prov.id)) {
          setExceptionsList((prev) => [...prev, prov]);
        }
        addToast('WARNING', 'Interrupção Touchless', 'Inconsistência de dados mestres encontrada. Redirecionado para Fila de Exceções.');
        setIsProcessing(false);
        return;
      }

      // 2. Camada 3: Workflow
      if (prov.requiredApprovalTier === 'TOUCHLESS_AUTO') {
        prov.status = 'APPROVED';
        prov.approvalStatus = {
          tier: 'TOUCHLESS_AUTO',
          approverName: 'Sistema Provisiona (Auto Touchless)',
          approvedAt: new Date().toISOString(),
        };

        const auditWork = await WorkflowService.appendAuditEntry(prov, {
          actor: 'Workflow (Camada 3)',
          actorRole: 'Governance Engine',
          action: 'APROVAÇÃO TOUCHLESS AUTOMÁTICA',
          layer: 'CAMADA_3_WORKFLOW',
          details: 'Alçada automática validada.',
          isAutomated: true,
        });
        prov.auditTrail = [...prov.auditTrail, auditWork];
      } else {
        prov.status = 'PENDING_APPROVAL';
        setCurrentProvision(prov);
        setCurrentLayerStep(3);
        addToast('WARNING', 'Alçada de Diretoria Exigida', 'Valor acima da alçada automática. Aguardando assinatura digital.');
        setIsProcessing(false);
        return;
      }

      // 3. Camada 4: SAP Posting
      const sapRes = await SapConnectorService.postAccountingDocument(prov);
      if (sapRes.status === 'SUCCESS') {
        prov.status = 'POSTED_SAP';
        prov.sapResult = sapRes;

        const auditSap = await WorkflowService.appendAuditEntry(prov, {
          actor: 'Conector SAP S/4HANA (Camada 4)',
          actorRole: 'ERP Integration Suite',
          action: `LANÇAMENTO SAP EFETUADO (BELNR ${sapRes.belnr})`,
          layer: 'CAMADA_4_SAP',
          details: `Documento gravado no SAP. Chave BKPF-XBLNR: ${sapRes.idempotencyHash}.`,
          isAutomated: true,
        });
        prov.auditTrail = [...prov.auditTrail, auditSap];
        setCurrentProvision(prov);
        setCurrentLayerStep(4);
        addToast('SUCCESS', 'Lançamento Touchless 100% Concluído!', `Provisão postada no SAP com BELNR ${sapRes.belnr}.`);
      }
    } catch (err: any) {
      addToast('ERROR', 'Erro', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Teste de Colisão de Idempotência
  const handleTestIdempotency = async () => {
    setIsProcessing(true);
    try {
      const res = await SapConnectorService.postAccountingDocument(currentProvision, false);
      if (res.status === 'DUPLICATE_REJECTED') {
        setDuplicateBlockedCount((prev) => prev + 1);
        addToast(
          'ERROR',
          '🔒 Guardião de Idempotência Ativo!',
          `[SAP RW 610] Documento duplicado bloqueado! A chave ${res.idempotencyHash} já existe no SAP. Zero duplicações garantidas.`
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Execução de Reversão Contábil (FB08)
  const handleExecuteReversal = async () => {
    setIsProcessing(true);
    try {
      const revResult = await SapConnectorService.reverseAccountingDocument(currentProvision);
      const updatedProv: ProvisionRecord = {
        ...currentProvision,
        status: 'REVERSED_SAP',
        isReversed: true,
      };

      const auditEntry = await WorkflowService.appendAuditEntry(updatedProv, {
        actor: 'Módulo de Reversão Automática SAP (Camada 4)',
        actorRole: 'ERP Automated Reversal FB08',
        action: `REVERSÃO CONTÁBIL EXECUTADA (ESTORNO ${revResult.reversalBelnr})`,
        layer: 'CAMADA_4_SAP',
        details: revResult.message,
        isAutomated: true,
      });

      updatedProv.auditTrail = [...updatedProv.auditTrail, auditEntry];
      setCurrentProvision(updatedProv);
      addToast('SUCCESS', 'Estorno FB08 Concluído!', revResult.message);
    } catch (err: any) {
      addToast('ERROR', 'Falha na Reversão', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Resolução de Exceção com Realimentação de Modelo
  const handleResolveException = async (
    provToResolve: ProvisionRecord,
    corrections: { costCenter?: string; glAccount?: string; grossAmount?: number; vendorCnpj?: string },
    justification: string
  ) => {
    const { updatedProvision, mlFeedbackMessage } = await WorkflowService.resolveExceptionAndRetrain(
      provToResolve,
      corrections,
      justification
    );

    // Re-valida com os novos parâmetros
    const val = ValidationEngineService.runValidation(updatedProvision);
    updatedProvision.validationResults = val.ruleResults;
    updatedProvision.costCenterName = val.costCenterName || updatedProvision.costCenterName;
    updatedProvision.glAccountName = val.glAccountName || updatedProvision.glAccountName;

    // Atualiza estado
    setCurrentProvision(updatedProvision);
    setExceptionsList((prev) => prev.filter((e) => e.id !== provToResolve.id));
    setIsExceptionQueueOpen(false);

    addToast('SUCCESS', 'Modelo Realimentado (Active Learning)', mlFeedbackMessage);
  };

  // Aprovação Manual por Alçada
  const handleApproveProvision = async (approverName: string, tier: ApprovalTier, comment?: string) => {
    const approvedProv = await WorkflowService.approveProvision(currentProvision, approverName, tier, comment);

    // Avança para postagem no SAP
    const sapRes = await SapConnectorService.postAccountingDocument(approvedProv);
    if (sapRes.status === 'SUCCESS') {
      approvedProv.status = 'POSTED_SAP';
      approvedProv.sapResult = sapRes;

      const auditSap = await WorkflowService.appendAuditEntry(approvedProv, {
        actor: 'Conector SAP S/4HANA (Camada 4)',
        actorRole: 'ERP Integration Suite',
        action: `LANÇAMENTO SAP EFETUADO (BELNR ${sapRes.belnr})`,
        layer: 'CAMADA_4_SAP',
        details: `Documento gravado no SAP após aprovação da Diretoria.`,
        isAutomated: true,
      });

      approvedProv.auditTrail = [...approvedProv.auditTrail, auditSap];
      setCurrentProvision(approvedProv);
      setCurrentLayerStep(4);
      addToast('SUCCESS', 'Assinatura Registrada & Documento SAP Gravado!', `BELNR ${sapRes.belnr} gerado no SAP.`);
    }
  };

  // Rejeição
  const handleRejectProvision = async (rejecterName: string, reason: string) => {
    const rejectedProv = await WorkflowService.rejectProvision(currentProvision, rejecterName, reason);
    setCurrentProvision(rejectedProv);
    addToast('WARNING', 'Provisão Rejeitada', `Rejeitada por ${rejecterName}. Motivo: ${reason}`);
  };

  // Ingestão de Nova Provisão Customizada
  const handleIngestNewProvision = (newProv: ProvisionRecord) => {
    setCurrentProvision(newProv);
    setSelectedScenarioId('CUSTOM');
    setCurrentLayerStep(1);
    setIsNewProvisionOpen(false);
    addToast('SUCCESS', 'Documento Ingerido', `Novo documento ${newProv.document.fileName} adicionado à esteira.`);
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <Header
        onOpenMasterData={() => setIsMasterDataOpen(true)}
        onOpenExceptionQueue={() => setIsExceptionQueueOpen(true)}
        onOpenNewProvision={() => setIsNewProvisionOpen(true)}
        exceptionCount={exceptionsList.length}
        sapConnected={true}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Executive Metrics Overview */}
        <MetricsOverview duplicateCollisionsPrevented={duplicateBlockedCount} />

        {/* Tab 1: Esteira Operacional (4 Camadas) */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            {/* Scenario Switcher */}
            <ScenarioSelector
              selectedScenarioId={selectedScenarioId}
              onSelectScenario={handleSelectScenario}
              onResetToInitialState={handleReset}
            />

            {/* Ingestion 4-Layer Stepper Pipeline */}
            <IngestionPipeline
              provision={currentProvision}
              currentStep={currentLayerStep}
              isProcessing={isProcessing}
              onAdvanceLayer={handleAdvanceLayer}
              onProcessAllTouchless={handleProcessAllTouchless}
              onTestIdempotency={handleTestIdempotency}
              onExecuteReversal={handleExecuteReversal}
            />

            {/* Layer 1: Document View & Extraction */}
            <DocumentViewer provision={currentProvision} />

            {/* Layer 2: Rules Engine Diagnostic Matrix */}
            {currentLayerStep >= 2 && (
              <ValidationMatrix
                provision={currentProvision}
                onOpenExceptionQueue={() => setIsExceptionQueueOpen(true)}
              />
            )}

            {/* Layer 3: Workflow, Approval Matrix & SHA-256 Audit Trail */}
            {currentLayerStep >= 3 && (
              <WorkflowAudit
                provision={currentProvision}
                onApprove={handleApproveProvision}
                onReject={handleRejectProvision}
              />
            )}

            {/* Layer 4: SAP S/4HANA FB03 GUI, BAPI Payload & Idempotency Inspector */}
            {currentLayerStep >= 4 && (
              <SapPostingInspector
                provision={currentProvision}
                onTestIdempotency={handleTestIdempotency}
                onExecuteReversal={handleExecuteReversal}
                isProcessing={isProcessing}
              />
            )}
          </div>
        )}

        {/* Tab 2: Cockpit & Telemetria */}
        {activeTab === 'cockpit' && (
          <CockpitTelemetry
            touchlessCount={38}
            exceptionCount={exceptionsList.length}
            totalPostedSap={46}
            totalReversals={12}
            duplicateBlockedCount={duplicateBlockedCount}
          />
        )}

        {/* Tab 3: Inspetor CPC 25 / IAS 37 */}
        {activeTab === 'cpc25' && (
          <Cpc25Inspector provision={currentProvision} />
        )}
      </main>

      {/* Modals */}
      {isMasterDataOpen && (
        <MasterDataModal onClose={() => setIsMasterDataOpen(false)} />
      )}

      {isExceptionQueueOpen && (
        <ExceptionQueue
          exceptions={exceptionsList}
          onClose={() => setIsExceptionQueueOpen(false)}
          onResolveException={handleResolveException}
        />
      )}

      {isNewProvisionOpen && (
        <NewProvisionModal
          onClose={() => setIsNewProvisionOpen(false)}
          onIngestNewProvision={handleIngestNewProvision}
        />
      )}

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start space-x-3 transition-all transform animate-in slide-in-from-bottom-2 ${
              toast.type === 'SUCCESS'
                ? 'bg-slate-900/95 border-emerald-500/50 text-white'
                : toast.type === 'ERROR'
                ? 'bg-slate-900/95 border-rose-500/50 text-white'
                : toast.type === 'WARNING'
                ? 'bg-slate-900/95 border-amber-500/50 text-white'
                : 'bg-slate-900/95 border-blue-500/50 text-white'
            }`}
          >
            <div className="mt-0.5">
              {toast.type === 'SUCCESS' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'ERROR' && <AlertOctagon className="w-5 h-5 text-rose-400" />}
              {toast.type === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {toast.type === 'INFO' && <Sparkles className="w-5 h-5 text-blue-400" />}
            </div>
            <div className="flex-1 text-xs">
              <h4 className="font-bold">{toast.title}</h4>
              <p className="text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Enterprise Footer */}
      <footer className="mt-12 border-t border-brand-border/60 py-6 text-center text-xs text-brand-muted bg-brand-surface/40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PROVISIONA · Automação Inteligente de Provisões Contábeis com Integração SAP</span>
          <span className="font-mono text-[11px] text-slate-500">Atvos · Chamada de Inovação · Arquitetura em 4 Camadas</span>
        </div>
      </footer>
    </div>
  );
}
export default App;
