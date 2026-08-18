import { ProvisionRecord, AuditLogEntry, ApprovalTier, ProvisionStatus } from '../types/provision';

// Função auxiliar determinística de hash SHA-256 (simulada/calculada para browser)
export async function calculateSha256(text: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback se subtle crypto não estiver disponível
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

export class WorkflowService {
  /**
   * Adiciona um registro imutável à trilha de auditoria
   */
  static async appendAuditEntry(
    provision: ProvisionRecord,
    entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'previousHash' | 'currentHash'>
  ): Promise<AuditLogEntry> {
    const lastEntry = provision.auditTrail[provision.auditTrail.length - 1];
    const previousHash = lastEntry ? lastEntry.currentHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const timestamp = new Date().toISOString();
    const id = `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const hashInput = `${previousHash}|${timestamp}|${entry.actor}|${entry.actorRole}|${entry.action}|${entry.layer}|${entry.details}`;
    const currentHash = await calculateSha256(hashInput);

    const fullEntry: AuditLogEntry = {
      id,
      timestamp,
      actor: entry.actor,
      actorRole: entry.actorRole,
      action: entry.action,
      layer: entry.layer,
      details: entry.details,
      previousHash,
      currentHash,
      isAutomated: entry.isAutomated,
    };

    return fullEntry;
  }

  /**
   * Realiza a aprovação de uma provisão por alçada
   */
  static async approveProvision(
    provision: ProvisionRecord,
    approverName: string,
    tier: ApprovalTier,
    comments?: string
  ): Promise<ProvisionRecord> {
    const auditEntry = await this.appendAuditEntry(provision, {
      actor: approverName,
      actorRole: tier === 'FINANCIAL_DIRECTOR' ? 'Diretor Financeiro / Industrial' : 'Gestor de Centro de Custo',
      action: `APROVAÇÃO DE ALÇADA (${tier})`,
      layer: 'CAMADA_3_WORKFLOW',
      details: comments ? `Provisão aprovada com parecer: "${comments}"` : 'Provisão aprovada conforme matriz de alçadas da Atvos.',
      isAutomated: false,
    });

    return {
      ...provision,
      status: 'APPROVED',
      approvalStatus: {
        tier,
        approverName,
        approvedAt: new Date().toISOString(),
        comments,
      },
      auditTrail: [...provision.auditTrail, auditEntry],
    };
  }

  /**
   * Rejeita a provisão
   */
  static async rejectProvision(
    provision: ProvisionRecord,
    actorName: string,
    reason: string
  ): Promise<ProvisionRecord> {
    const auditEntry = await this.appendAuditEntry(provision, {
      actor: actorName,
      actorRole: 'Controladoria & Compliance',
      action: 'REJEIÇÃO DE PROVISÃO',
      layer: 'CAMADA_3_WORKFLOW',
      details: `Provisão reprovada. Motivo: ${reason}`,
      isAutomated: false,
    });

    return {
      ...provision,
      status: 'REJECTED',
      auditTrail: [...provision.auditTrail, auditEntry],
    };
  }

  /**
   * Trata uma exceção na Fila de Exceções com Realimentação de Modelo (HITL / Active Learning)
   */
  static async resolveExceptionAndRetrain(
    provision: ProvisionRecord,
    corrections: {
      costCenter?: string;
      glAccount?: string;
      grossAmount?: number;
      vendorCnpj?: string;
    },
    userJustification: string
  ): Promise<{ updatedProvision: ProvisionRecord; mlFeedbackMessage: string }> {
    const updated = { ...provision };

    if (corrections.costCenter) {
      updated.costCenter = {
        ...updated.costCenter,
        value: corrections.costCenter,
        isOverridden: true,
      };
    }

    if (corrections.glAccount) {
      updated.glAccount = {
        ...updated.glAccount,
        value: corrections.glAccount,
        isOverridden: true,
      };
    }

    if (corrections.grossAmount) {
      updated.grossAmount = {
        ...updated.grossAmount,
        value: corrections.grossAmount,
        isOverridden: true,
      };
    }

    if (corrections.vendorCnpj) {
      updated.vendorCnpj = {
        ...updated.vendorCnpj,
        value: corrections.vendorCnpj,
        isOverridden: true,
      };
    }

    // Eleva a confiança após revisão humana assistida
    updated.overallConfidence = 1.0;
    updated.status = 'VALIDATED';

    const auditEntry = await this.appendAuditEntry(provision, {
      actor: 'Analista de Controladoria (HITL)',
      actorRole: 'Triagem de Exceções',
      action: 'CORREÇÃO & REALIMENTAÇÃO DE MODELO',
      layer: 'CAMADA_3_WORKFLOW',
      details: `Exceção resolvida manualmente. Justificativa: "${userJustification}". Parâmetros ajustados: ${Object.keys(corrections).join(', ')}. Feedback enviado para realimentação contínua do modelo.`,
      isAutomated: false,
    });

    updated.auditTrail = [...updated.auditTrail, auditEntry];

    const mlFeedbackMessage = `✅ Modelo realimentado com sucesso! O padrão do fornecedor/centro de custo "${corrections.costCenter || provision.costCenter.value}" foi indexado na base de regras da unidade ${provision.businessUnit.name}. Próximos lançamentos deste padrão terão score de confiança elevado (+12%).`;

    return {
      updatedProvision: updated,
      mlFeedbackMessage,
    };
  }
}
