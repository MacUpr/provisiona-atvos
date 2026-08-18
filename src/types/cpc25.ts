export type OutflowProbability = 'PROBABLE_GT_50' | 'POSSIBLE_10_50' | 'REMOTE_LT_10';

export type ProvisionAccountingType =
  | 'PROVISAO_RECONHECIDA'        // Reconhecer no Balanço Patrimonial como Passivo (CPC 25 item 14)
  | 'PASSIVO_CONTINGENTE_DIVULGADO' // Divulgar apenas em Notas Explicativas (CPC 25 item 27)
  | 'NAO_EXIGE_DIVULGACAO'        // Probabilidade remota: nenhuma provisão nem nota
  | 'ACCRUAL_OPERACIONAL';        // Fato gerador ocorrido com contraprestação recebida (competência)

export interface Cpc25Criterion {
  id: string;
  name: string;
  question: string;
  fulfilled: boolean;
  justification: string;
  normativeReference: string;
}

export interface Cpc25Classification {
  hasPresentObligation: boolean; // Obrigação presente resultante de evento passado
  outflowProbability: OutflowProbability; // Saída de recursos que incorporam benefícios econômicos
  hasReliableEstimate: boolean; // Estimativa confiável do valor da obrigação
  resultingClassification: ProvisionAccountingType;
  criteria: Cpc25Criterion[];
  technicalOpinion: string;
  evaluatedBy: string; // 'AI_COMPLIANCE_AGENT' | 'CONTROLLER'
  evaluatedAt: string;
}
