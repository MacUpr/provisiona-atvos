import { ProvisionRecord } from '../types/provision';
import {
  SapPostingPayload,
  SapPostingResult,
  SapReversalResult,
  SapDocumentHeader,
  SapDocumentItem,
} from '../types/sap';
import { calculateSha256 } from './workflowService';

// Armazenamento em memória para chaves de idempotência ativas
const IDEMPOTENCY_STORE = new Map<string, SapPostingResult>();

export class SapConnectorService {
  /**
   * Calcula a Chave Criptográfica / Negocial de Idempotência
   * Hash único baseado em: CNPJ + Empresa SAP + Referência + Competência + Valor
   */
  static async calculateIdempotencyKey(provision: ProvisionRecord): Promise<string> {
    const rawKey = [
      provision.vendorCnpj.value.replace(/\D/g, ''),
      provision.businessUnit.companyCode,
      provision.referenceNumber,
      provision.competencia,
      provision.grossAmount.value.toFixed(2),
    ].join('::');

    const hash = await calculateSha256(rawKey);
    return `IDEMP-ATVOS-${hash.substring(0, 16).toUpperCase()}`;
  }

  /**
   * Monta o Payload oficial BAPI_ACC_DOCUMENT_POST (SAP S/4HANA / ECC)
   */
  static async buildBapiPayload(provision: ProvisionRecord): Promise<SapPostingPayload> {
    const idempotencyKey = await this.calculateIdempotencyKey(provision);
    const today = new Date().toISOString().split('T')[0];
    const [yearStr, monthStr] = provision.competencia.split('-');
    const gjahr = parseInt(yearStr, 10);
    const monat = parseInt(monthStr, 10);

    const header: SapDocumentHeader = {
      bukrs: provision.businessUnit.companyCode,
      gjahr,
      blart: 'SA', // Documento Geral / Provisão
      bldat: today,
      budat: today,
      monat,
      waers: provision.currency || 'BRL',
      xblnr: idempotencyKey, // Gravado no cabeçalho BKPF-XBLNR
      bktxt: `PROV ${provision.businessUnit.code} ${provision.competencia}`.substring(0, 25),
    };

    const items: SapDocumentItem[] = [
      // Item 1: DÉBITO (Despesa Operacional) - Chave 40
      {
        buzei: 1,
        bschl: '40', // Débito
        hkont: provision.glAccount.value,
        accountName: provision.glAccountName || 'Despesa Operacional',
        wrbtr: provision.grossAmount.value,
        shkzg: 'S',
        kostl: provision.costCenter.value,
        sgtxt: provision.itemDescription.value.substring(0, 50),
      },
      // Item 2: CRÉDITO (Provisão Passivo Circulante) - Chave 50
      {
        buzei: 2,
        bschl: '50', // Crédito
        hkont: '2104001', // Conta de Passivo de Provisão
        accountName: 'Provisão para Serviços a Faturar (Fornecedores)',
        wrbtr: provision.grossAmount.value,
        shkzg: 'H',
        sgtxt: `Contrapartida Provisão ${provision.referenceNumber}`.substring(0, 50),
      },
    ];

    return {
      header,
      items,
      idempotencyKey,
    };
  }

  /**
   * Executa a Camada 4: Lançamento Idempotente no SAP
   */
  static async postAccountingDocument(
    provision: ProvisionRecord,
    forceDuplicateTest: boolean = false
  ): Promise<SapPostingResult> {
    const payload = await this.buildBapiPayload(provision);
    const key = payload.idempotencyKey;

    // 1. Verificação do Guardião de Idempotência
    if (IDEMPOTENCY_STORE.has(key) && !forceDuplicateTest) {
      const existing = IDEMPOTENCY_STORE.get(key)!;
      return {
        status: 'DUPLICATE_REJECTED',
        bukrs: provision.businessUnit.companyCode,
        gjahr: payload.header.gjahr,
        idempotencyHash: key,
        postedAt: new Date().toISOString(),
        protocol: `ERR-IDEMP-${Date.now()}`,
        message: `[IDEMPOTENCY BLOCK] Documento duplicado detectado! O lançamento com a chave "${key}" já foi processado no SAP com o número de documento BELNR ${existing.belnr}. O re-lançamento foi rejeitado para proteger a integridade contábil.`,
        rawPayload: payload,
        bapiReturn: [
          {
            type: 'E',
            id: 'RW',
            number: '610',
            message: `Documento de referência ${key} já lançado no exercício ${payload.header.gjahr}. Lançamento duplicado abortado.`,
            logNo: 'SAP-INT-IDEMP-001',
          },
        ],
      };
    }

    // 2. Simulação de Sucesso no SAP (Geração do BELNR de 10 dígitos)
    const randomDocNum = Math.floor(1900000000 + Math.random() * 9999999);
    const belnr = randomDocNum.toString();
    const postedAt = new Date().toISOString();

    const successResult: SapPostingResult = {
      status: 'SUCCESS',
      belnr,
      gjahr: payload.header.gjahr,
      bukrs: payload.header.bukrs,
      idempotencyHash: key,
      postedAt,
      protocol: `SAP-BAPI-ACC-DOC-${belnr}`,
      message: `Documento contábil lançado com sucesso no SAP S/4HANA (BELNR: ${belnr}, Empresa: ${payload.header.bukrs}, Exercício: ${payload.header.gjahr}).`,
      rawPayload: payload,
      bapiReturn: [
        {
          type: 'S',
          id: 'RW',
          number: '609',
          message: `Documento contábil ${belnr} ${payload.header.bukrs} ${payload.header.gjahr} gravado no banco de dados SAP.`,
          logNo: `BAPI-LOG-${Date.now()}`,
        },
        {
          type: 'S',
          id: 'BK',
          number: '001',
          message: `Chave de referência BKPF-XBLNR [${key}] indexada com sucesso no índice secundário de idempotência.`,
          logNo: `SAP-INDX-${Date.now()}`,
        },
      ],
    };

    // Armazena na base de idempotência
    IDEMPOTENCY_STORE.set(key, successResult);

    return successResult;
  }

  /**
   * Executa a Reversão Automática da Provisão (FB08 / BAPI_ACC_DOCUMENT_REV_POST)
   */
  static async reverseAccountingDocument(provision: ProvisionRecord): Promise<SapReversalResult> {
    if (!provision.sapResult || !provision.sapResult.belnr) {
      throw new Error('Não é possível reverter uma provisão que ainda não possui documento gerado no SAP.');
    }

    const originalBelnr = provision.sapResult.belnr;
    const reversalBelnr = (parseInt(originalBelnr, 10) + 1).toString();
    const reversedAt = new Date().toISOString();

    return {
      status: 'SUCCESS',
      originalBelnr,
      reversalBelnr,
      reversedAt,
      reasonCode: '01 - Reversão Automática no Período Seguinte (Estorno Contábil FB08)',
      message: `Provisão ${originalBelnr} estornada com sucesso no SAP através do documento de reversão ${reversalBelnr} (FB08). Partidas compensadas integralmente.`,
    };
  }

  /**
   * Limpa o cache de idempotência para testes
   */
  static clearIdempotencyCache() {
    IDEMPOTENCY_STORE.clear();
  }
}
