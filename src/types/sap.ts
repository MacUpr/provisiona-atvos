export interface SapVendor {
  lifnr: string; // Código Fornecedor SAP (LFA1-LIFNR)
  name1: string; // Razão Social (LFA1-NAME1)
  stcd1: string; // CNPJ (LFA1-STCD1)
  ktokk: string; // Grupo de Contas (LFA1-KTOKK)
  isActive: boolean;
  blockedForPosting: boolean;
}

export interface SapCostCenter {
  kostl: string; // Centro de Custo (CSKS-KOSTL)
  ktext: string; // Descrição (CSKT-KTEXT)
  bukrs: string; // Empresa (CSKS-BUKRS)
  werks: string; // Centro/Planta (CSKS-WERKS)
  prctr: string; // Centro de Lucro (CSKS-PRCTR)
  responsibleManager: string; // Responsável pela alçada
  managerEmail: string;
  isActive: boolean;
}

export interface SapGlAccount {
  saknr: string; // Conta Razão (SKA1-SAKNR)
  txt50: string; // Descrição da Conta (SKAT-TXT50)
  accountType: 'EXPENSE' | 'PROVISION_LIABILITY' | 'ASSET';
  isAutoPostingOnly: boolean;
  isActive: boolean;
}

export interface SapAccountingPeriod {
  bukrs: string;
  gjahr: number; // Exercício (Ex: 2026)
  poper: number; // Período/Mês (Ex: 8)
  isOpen: boolean; // Status no OB52
}

export interface SapDocumentHeader {
  bukrs: string; // Empresa (Ex: 1000)
  gjahr: number; // Exercício Fiscal
  belnr?: string; // Número do Documento Contábil SAP (gerado após POST)
  blart: string; // Tipo de Documento ('SA' - Lançamento Geral / 'PR' - Provisão)
  bldat: string; // Data do Documento (YYYY-MM-DD)
  budat: string; // Data de Lançamento (YYYY-MM-DD)
  monat: number; // Período Contábil (1-12)
  waers: string; // Moeda ('BRL')
  xblnr: string; // Referência / Chave de Idempotência (BKPF-XBLNR)
  bktxt: string; // Texto de Cabeçalho (Ex: "PROV CANA ST LUZIA AGO/26")
}

export interface SapDocumentItem {
  buzei: number; // Item (1, 2, ...)
  bschl: string; // Chave de Lançamento ('40' Débito Despesa, '50' Crédito Provisão)
  hkont: string; // Conta Contábil (SKA1-SAKNR)
  accountName: string;
  wrbtr: number; // Valor no montante da moeda
  shkzg: 'S' | 'H'; // Débito ('S') / Crédito ('H')
  kostl?: string; // Centro de Custo (CSKS-KOSTL)
  sgtxt: string; // Texto do Item
}

export interface SapPostingPayload {
  header: SapDocumentHeader;
  items: SapDocumentItem[];
  idempotencyKey: string;
}

export interface SapPostingResult {
  status: 'SUCCESS' | 'DUPLICATE_REJECTED' | 'ERROR';
  belnr?: string; // Número do Documento SAP (10 dígitos, ex: 1900045231)
  gjahr: number;
  bukrs: string;
  idempotencyHash: string;
  postedAt: string;
  protocol: string; // Ex: SAP-RFC-ACC-DOC-982312
  message: string;
  rawPayload: SapPostingPayload;
  bapiReturn: {
    type: 'S' | 'E' | 'W' | 'I';
    id: string;
    number: string;
    message: string;
    logNo: string;
  }[];
}

export interface SapReversalResult {
  status: 'SUCCESS' | 'ERROR';
  originalBelnr: string;
  reversalBelnr: string; // Número do Documento de Estorno (ex: 1900045232)
  reversedAt: string;
  reasonCode: string; // Ex: '01' - Reversão Período Seguinte (FB08)
  message: string;
}
