import { Cpc25Classification } from './cpc25';
import { SapPostingResult } from './sap';

export type ProvisionStatus =
  | 'INGESTED'            // Extraído na Camada 1
  | 'VALIDATING'          // Em validação na Camada 2
  | 'VALIDATED'           // Aprovado nas regras de validação
  | 'EXCEPTION_QUEUE'     // Com inconsistência ou baixa confiança (requer HITL)
  | 'PENDING_APPROVAL'    // Aguardando aprovação de alçada
  | 'APPROVED'            // Aprovado pelo gestor
  | 'POSTED_SAP'          // Lançado com sucesso no SAP (Camada 4)
  | 'REVERSED_SAP'        // Reversão contábil executada no SAP
  | 'REJECTED';           // Rejeitado na alçada ou compliance

export type ApprovalTier = 'TOUCHLESS_AUTO' | 'COST_CENTER_MANAGER' | 'CONTROLLER_MANAGER' | 'FINANCIAL_DIRECTOR';

export interface BoundingBox {
  field: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number;
  height: number;
  confidence: number;
}

export interface ExtractedField<T = string | number> {
  value: T;
  rawText: string;
  confidence: number; // 0.0 to 1.0
  isOverridden?: boolean;
  validationError?: string;
  suggestedCorrection?: T;
}

export interface DocumentAttachment {
  id: string;
  fileName: string;
  fileType: 'PDF' | 'IMAGE' | 'EXCEL' | 'XML';
  fileSize: string;
  uploadedAt: string;
  previewUrl?: string;
  boundingBoxes: BoundingBox[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  layer: 'CAMADA_1_CAPTURA' | 'CAMADA_2_VALIDACAO' | 'CAMADA_3_WORKFLOW' | 'CAMADA_4_SAP';
  details: string;
  previousHash: string;
  currentHash: string; // SHA-256
  isAutomated: boolean;
}

export interface ValidationRuleResult {
  ruleId: string;
  name: string;
  layer: 'MASTER_DATA' | 'ACCOUNTING_PERIOD' | 'CPC25' | 'APPROVAL_MATRIX' | 'TAX_CONSISTENCY';
  status: 'PASSED' | 'FAILED' | 'WARNING';
  message: string;
  details?: string;
  sapTableRef?: string;
  fieldImpacted?: string;
}

export interface ProvisionRecord {
  id: string;
  referenceNumber: string; // Ex: PROV-2026-ATV-0891
  businessUnit: {
    code: string; // Ex: U-SLUZ (Santa Luzia), U-ELDO (Eldorado), U-CRIS (Costa Rica)
    name: string;
    cnpj: string;
    companyCode: string; // SAP BUKRS (Ex: 1000, 1100)
    plant: string; // SAP WERKS (Ex: 1101, 1201)
  };
  documentType: 'MEDICAO_COLHEITA' | 'MANUTENCAO_SAFRA' | 'FRETE_LOGISTICA' | 'ARRENDAMENTO_ROYALTIES' | 'SERVICO_AMBIENTAL';
  documentTitle: string;
  competencia: string; // Formato: YYYY-MM (Ex: 2026-08)
  dueDate: string; // Data prevista de vencimento/faturamento definitivo
  reversalScheduledDate?: string; // Data prevista para reversão automática FB08
  
  // Dados Financeiros & Contábeis
  vendor: ExtractedField<string>; // Razão Social
  vendorCnpj: ExtractedField<string>; // CNPJ Fornecedor (LFA1)
  costCenter: ExtractedField<string>; // Centro de Custo (CSKS - KOSTL)
  costCenterName?: string;
  glAccount: ExtractedField<string>; // Conta Contábil Razão (SKA1 - HKONT)
  glAccountName?: string;
  grossAmount: ExtractedField<number>;
  currency: string;
  itemDescription: ExtractedField<string>;
  contractOrPoNumber?: ExtractedField<string>; // Pedido de Compras / Contrato SAP (EBELN)

  // Metadados de Inteligência & Validação
  overallConfidence: number; // Média ponderada dos scores (0-100%)
  touchlessEligible: boolean; // Se cumpre todos os requisitos para Touchless (Score > 90% e 0 inconsistências)
  status: ProvisionStatus;
  
  // Sub-sistemas
  document: DocumentAttachment;
  validationResults: ValidationRuleResult[];
  cpc25: Cpc25Classification;
  requiredApprovalTier: ApprovalTier;
  approvalStatus: {
    tier: ApprovalTier;
    approverName?: string;
    approvedAt?: string;
    comments?: string;
  };
  
  // Trilha de Auditoria Imutável (Camada 3)
  auditTrail: AuditLogEntry[];
  
  // Lançamento SAP (Camada 4)
  sapResult?: SapPostingResult;
  isReversed?: boolean;
}
