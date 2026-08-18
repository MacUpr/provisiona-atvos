import { ProvisionRecord, ExtractedField, DocumentAttachment, BoundingBox } from '../types/provision';

export interface RawDocumentInput {
  fileName: string;
  fileType: 'PDF' | 'IMAGE' | 'EXCEL' | 'XML';
  fileSize: string;
  rawText?: string;
}

/** @deprecated Mock implementation. Replace with real OCR/LLM service in production. */
export class MockOcrExtractorService {
  /**
   * Executa a Camada 1: Classificação, Extração com OCR/LLM e Cálculo de Score de Confiança
   */
  static extractDocument(input: RawDocumentInput, simulatedPreset?: Partial<ProvisionRecord>): Partial<ProvisionRecord> {
    if (simulatedPreset) {
      return simulatedPreset;
    }

    // Heurística de extração genérica para arquivos novos submetidos pelo usuário
    const vendorField: ExtractedField<string> = {
      value: 'AGROSAFRA COLHEITA & LOGÍSTICA LTDA',
      rawText: 'AGROSAFRA COLHEITA & LOGISTICA LTDA - ME',
      confidence: 0.96,
    };

    const vendorCnpjField: ExtractedField<string> = {
      value: '12.345.678/0001-90',
      rawText: '12.345.678/0001-90',
      confidence: 0.98,
    };

    const costCenterField: ExtractedField<string> = {
      value: 'CC-1100-AGR01',
      rawText: 'CENTRO DE CUSTO: 1100-AGR01',
      confidence: 0.94,
    };

    const glAccountField: ExtractedField<string> = {
      value: '5101001',
      rawText: 'CTA CONTABIL: 5101001 DESP COLHEITA',
      confidence: 0.92,
    };

    const amountField: ExtractedField<number> = {
      value: 185420.50,
      rawText: 'R$ 185.420,50',
      confidence: 0.97,
    };

    const descField: ExtractedField<string> = {
      value: 'Medição quinzenal de colheita mecanizada de cana-de-açúcar - Bloco 4',
      rawText: 'MEDICAO SERVICO COLHEITA MECANIZADA CANA SAFRA 26/27',
      confidence: 0.95,
    };

    const overallConfidence = (
      vendorField.confidence * 0.2 +
      vendorCnpjField.confidence * 0.2 +
      costCenterField.confidence * 0.2 +
      glAccountField.confidence * 0.15 +
      amountField.confidence * 0.25
    );

    const boundingBoxes: BoundingBox[] = [
      { field: 'vendor', x: 8, y: 12, width: 45, height: 4, confidence: 0.96 },
      { field: 'vendorCnpj', x: 55, y: 12, width: 35, height: 4, confidence: 0.98 },
      { field: 'itemDescription', x: 8, y: 32, width: 84, height: 8, confidence: 0.95 },
      { field: 'costCenter', x: 8, y: 52, width: 38, height: 4, confidence: 0.94 },
      { field: 'glAccount', x: 50, y: 52, width: 40, height: 4, confidence: 0.92 },
      { field: 'grossAmount', x: 60, y: 76, width: 32, height: 6, confidence: 0.97 },
    ];

    const documentAttachment: DocumentAttachment = {
      id: `DOC-${Date.now()}`,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize: input.fileSize,
      uploadedAt: new Date().toISOString(),
      boundingBoxes,
    };

    return {
      vendor: vendorField,
      vendorCnpj: vendorCnpjField,
      costCenter: costCenterField,
      glAccount: glAccountField,
      grossAmount: amountField,
      itemDescription: descField,
      overallConfidence: Math.round(overallConfidence * 100) / 100,
      document: documentAttachment,
      touchlessEligible: overallConfidence >= 0.90,
      status: 'INGESTED',
    };
  }
}
