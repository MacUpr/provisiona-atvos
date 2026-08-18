import { ProvisionRecord, ValidationRuleResult, ApprovalTier } from '../types/provision';
import { Cpc25Classification } from '../types/cpc25';
import { SAP_VENDORS_DB, SAP_COST_CENTERS_DB, SAP_GL_ACCOUNTS_DB, SAP_OPEN_PERIODS_DB } from './masterDataStore';

export interface ValidationEngineOutput {
  isValid: boolean;
  hasWarnings: boolean;
  ruleResults: ValidationRuleResult[];
  cpc25: Cpc25Classification;
  requiredTier: ApprovalTier;
  touchlessEligible: boolean;
  costCenterName?: string;
  glAccountName?: string;
}

export class ValidationEngineService {
  /**
   * Executa a Camada 2: O Motor de Validação (O Coração da Solução - 80% do valor)
   */
  static runValidation(provision: ProvisionRecord): ValidationEngineOutput {
    const results: ValidationRuleResult[] = [];
    let isValid = true;
    let hasWarnings = false;

    // -------------------------------------------------------------
    // REGRA 1: Confrontação de Fornecedor / CNPJ (SAP LFA1)
    // -------------------------------------------------------------
    const cleanCnpj = provision.vendorCnpj.value.replace(/\D/g, '');
    const vendorMatch = SAP_VENDORS_DB.find(
      (v) => v.stcd1.replace(/\D/g, '') === cleanCnpj || v.name1.toLowerCase().includes(provision.vendor.value.toLowerCase().substring(0, 8))
    );

    if (!vendorMatch) {
      isValid = false;
      results.push({
        ruleId: 'SAP-MD-01',
        name: 'Confronto Fornecedor / CNPJ (SAP LFA1)',
        layer: 'MASTER_DATA',
        status: 'FAILED',
        message: `CNPJ ${provision.vendorCnpj.value} não localizado no cadastro mestre de fornecedores SAP (LFA1).`,
        sapTableRef: 'LFA1-STCD1',
        fieldImpacted: 'vendorCnpj',
      });
    } else if (vendorMatch.blockedForPosting || !vendorMatch.isActive) {
      isValid = false;
      results.push({
        ruleId: 'SAP-MD-01',
        name: 'Status Fornecedor SAP (LFA1)',
        layer: 'MASTER_DATA',
        status: 'FAILED',
        message: `Fornecedor ${vendorMatch.name1} (Cód SAP ${vendorMatch.lifnr}) está BLOQUEADO para lançamentos contábeis no ERP.`,
        sapTableRef: 'LFA1-SPERR',
        fieldImpacted: 'vendor',
      });
    } else {
      results.push({
        ruleId: 'SAP-MD-01',
        name: 'Confronto Fornecedor / CNPJ (SAP LFA1)',
        layer: 'MASTER_DATA',
        status: 'PASSED',
        message: `Fornecedor validado: ${vendorMatch.name1} (Cód SAP: ${vendorMatch.lifnr}) - Cadastro Ativo.`,
        sapTableRef: 'LFA1-LIFNR',
      });
    }

    // -------------------------------------------------------------
    // REGRA 2: Confrontação de Centro de Custo (SAP CSKS)
    // -------------------------------------------------------------
    const costCenterMatch = SAP_COST_CENTERS_DB.find(
      (cc) => cc.kostl.toUpperCase() === provision.costCenter.value.toUpperCase()
    );

    let resolvedCostCenterName = '';
    if (!costCenterMatch) {
      isValid = false;
      results.push({
        ruleId: 'SAP-MD-02',
        name: 'Centro de Custo (SAP CSKS / CSKT)',
        layer: 'MASTER_DATA',
        status: 'FAILED',
        message: `Centro de Custo "${provision.costCenter.value}" não existe na tabela CSKS da empresa ${provision.businessUnit.companyCode}.`,
        sapTableRef: 'CSKS-KOSTL',
        fieldImpacted: 'costCenter',
      });
    } else if (!costCenterMatch.isActive) {
      isValid = false;
      results.push({
        ruleId: 'SAP-MD-02',
        name: 'Centro de Custo Bloqueado (SAP CSKS)',
        layer: 'MASTER_DATA',
        status: 'FAILED',
        message: `Centro de Custo ${costCenterMatch.kostl} (${costCenterMatch.ktext}) está INATIVO/ENCERRADO no SAP. Sugestão: ${costCenterMatch.kostl.replace('03', '04')}.`,
        sapTableRef: 'CSKS-BKZKP',
        fieldImpacted: 'costCenter',
        details: 'O centro de custo foi descontinuado na reestruturação da unidade.',
      });
    } else {
      resolvedCostCenterName = costCenterMatch.ktext;
      results.push({
        ruleId: 'SAP-MD-02',
        name: 'Centro de Custo (SAP CSKS / CSKT)',
        layer: 'MASTER_DATA',
        status: 'PASSED',
        message: `Centro de Custo validado: ${costCenterMatch.kostl} (${costCenterMatch.ktext}) - Gestor: ${costCenterMatch.responsibleManager}.`,
        sapTableRef: 'CSKS-KOSTL',
      });
    }

    // -------------------------------------------------------------
    // REGRA 3: Confrontação de Conta Razão (SAP SKA1)
    // -------------------------------------------------------------
    const glMatch = SAP_GL_ACCOUNTS_DB.find(
      (gl) => gl.saknr === provision.glAccount.value
    );

    let resolvedGlAccountName = '';
    if (!glMatch) {
      isValid = false;
      results.push({
        ruleId: 'SAP-MD-03',
        name: 'Plano de Contas Razão (SAP SKA1)',
        layer: 'MASTER_DATA',
        status: 'FAILED',
        message: `Conta Contábil ${provision.glAccount.value} não cadastrada no Plano de Contas corporativo Atvos.`,
        sapTableRef: 'SKA1-SAKNR',
        fieldImpacted: 'glAccount',
      });
    } else if (glMatch.accountType !== 'EXPENSE') {
      isValid = false;
      results.push({
        ruleId: 'SAP-MD-03',
        name: 'Natureza Contábil da Provisão',
        layer: 'MASTER_DATA',
        status: 'FAILED',
        message: `Conta ${glMatch.saknr} não é uma conta de despesa operacional (${glMatch.accountType}). Não pode ser contrapartida de débito da provisão.`,
        sapTableRef: 'SKA1-GVTYP',
        fieldImpacted: 'glAccount',
      });
    } else {
      resolvedGlAccountName = glMatch.txt50;
      results.push({
        ruleId: 'SAP-MD-03',
        name: 'Plano de Contas Razão (SAP SKA1)',
        layer: 'MASTER_DATA',
        status: 'PASSED',
        message: `Conta validada: ${glMatch.saknr} (${glMatch.txt50}) - Natureza de Despesa Operacional.`,
        sapTableRef: 'SKA1-SAKNR',
      });
    }

    // -------------------------------------------------------------
    // REGRA 4: Validação de Competência e Período Aberto (SAP OB52)
    // -------------------------------------------------------------
    const [yearStr, monthStr] = provision.competencia.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const periodMatch = SAP_OPEN_PERIODS_DB.find(
      (p) => p.bukrs === provision.businessUnit.companyCode && p.gjahr === year && p.poper === month
    );

    if (!periodMatch || !periodMatch.isOpen) {
      hasWarnings = true;
      results.push({
        ruleId: 'SAP-PER-01',
        name: 'Período Contábil Aberto (SAP OB52)',
        layer: 'ACCOUNTING_PERIOD',
        status: 'WARNING',
        message: `Competência ${provision.competencia} está fechada para lançamentos normais no SAP (OB52). Exige liberação extraordinária de Controladoria.`,
        sapTableRef: 'T001B-OB52',
        fieldImpacted: 'competencia',
      });
    } else {
      results.push({
        ruleId: 'SAP-PER-01',
        name: 'Período Contábil Aberto (SAP OB52)',
        layer: 'ACCOUNTING_PERIOD',
        status: 'PASSED',
        message: `Período contábil ${provision.competencia} (Mês ${month}/${year}) está ABERTO no SAP para a empresa ${provision.businessUnit.companyCode}.`,
        sapTableRef: 'T001B-OB52',
      });
    }

    // -------------------------------------------------------------
    // REGRA 5: Análise de Conformidade CPC 25 / IAS 37
    // -------------------------------------------------------------
    const cpc25Eval = provision.cpc25 || {
      hasPresentObligation: true,
      outflowProbability: 'PROBABLE_GT_50',
      hasReliableEstimate: true,
      resultingClassification: 'PROVISAO_RECONHECIDA',
      criteria: [
        {
          id: 'CPC25-01',
          name: 'Obrigação Presente',
          question: 'A entidade tem uma obrigação legal ou não formalizada presente como resultado de evento passado?',
          fulfilled: true,
          justification: 'Serviço prestado / medição realizada na competência anterior ao faturamento.',
          normativeReference: 'CPC 25 item 14 (a) / IAS 37.14',
        },
        {
          id: 'CPC25-02',
          name: 'Saída Provável de Recursos',
          question: 'É provável (>50%) que será necessária uma saída de recursos para liquidar a obrigação?',
          fulfilled: true,
          justification: 'Existe contrato vigente e contraprestação de serviços entregue pelo fornecedor.',
          normativeReference: 'CPC 25 item 14 (b) / IAS 37.14',
        },
        {
          id: 'CPC25-03',
          name: 'Estimativa Confiável',
          question: 'Pode ser feita uma estimativa confiável do valor da obrigação?',
          fulfilled: true,
          justification: 'Valor apurado por boletim de medição / tabela de frete / contrato.',
          normativeReference: 'CPC 25 item 14 (c) / IAS 37.14',
        },
      ],
      technicalOpinion: 'Atende integralmente os 3 critérios cumulativos do CPC 25 item 14. Deve ser reconhecida como Provisão no Passivo Circulante.',
      evaluatedBy: 'AI_COMPLIANCE_AGENT',
      evaluatedAt: new Date().toISOString(),
    };

    if (cpc25Eval.resultingClassification === 'PROVISAO_RECONHECIDA') {
      results.push({
        ruleId: 'CPC25-01',
        name: 'Enquadramento CPC 25 / IAS 37',
        layer: 'CPC25',
        status: 'PASSED',
        message: 'Aprovado: Reconhecimento obrigatório de Passivo de Provisão no Balanço Patrimonial.',
        details: cpc25Eval.technicalOpinion,
      });
    } else {
      results.push({
        ruleId: 'CPC25-01',
        name: 'Enquadramento CPC 25 / IAS 37',
        layer: 'CPC25',
        status: 'WARNING',
        message: `Classificado como "${cpc25Eval.resultingClassification}". Não gera lançamento contábil patrimonial direto.`,
        details: cpc25Eval.technicalOpinion,
      });
    }

    // -------------------------------------------------------------
    // REGRA 6: Matriz de Alçadas de Governança
    // -------------------------------------------------------------
    const grossAmount = provision.grossAmount.value;
    let requiredTier: ApprovalTier = 'TOUCHLESS_AUTO';

    if (!isValid || provision.overallConfidence < 0.85) {
      requiredTier = 'COST_CENTER_MANAGER';
    } else if (grossAmount > 400000) {
      requiredTier = 'FINANCIAL_DIRECTOR';
    } else if (grossAmount > 200000) {
      requiredTier = 'CONTROLLER_MANAGER';
    } else {
      requiredTier = 'TOUCHLESS_AUTO';
    }

    results.push({
      ruleId: 'GOV-ALC-01',
      name: 'Matriz de Alçadas de Aprovação',
      layer: 'APPROVAL_MATRIX',
      status: 'PASSED',
      message: `Alçada exigida: ${
        requiredTier === 'TOUCHLESS_AUTO' ? 'Touchless Automático (Valor ≤ R$ 200k & 0 inconsistências)' :
        requiredTier === 'CONTROLLER_MANAGER' ? 'Gerência de Controladoria (R$ 200k - R$ 400k)' :
        requiredTier === 'FINANCIAL_DIRECTOR' ? 'Diretoria Financeira / Industrial (> R$ 400k)' : 'Gestor de Centro de Custo'
      }`,
    });

    const isTouchlessEligible = isValid && !hasWarnings && provision.overallConfidence >= 0.90 && requiredTier === 'TOUCHLESS_AUTO';

    return {
      isValid,
      hasWarnings,
      ruleResults: results,
      cpc25: cpc25Eval,
      requiredTier,
      touchlessEligible: isTouchlessEligible,
      costCenterName: resolvedCostCenterName,
      glAccountName: resolvedGlAccountName,
    };
  }
}
