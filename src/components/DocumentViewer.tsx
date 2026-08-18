import React, { useState } from 'react';
import { ProvisionRecord } from '../types/provision';
import { FileText, Eye, CheckCircle, AlertCircle, Scan, Tag, Hash, Building, Landmark, DollarSign } from 'lucide-react';

interface DocumentViewerProps {
  provision: ProvisionRecord;
  onSelectField?: (fieldKey: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  provision,
  onSelectField,
}) => {
  const [highlightedField, setHighlightedField] = useState<string | null>(null);

  const getConfidenceBadge = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    if (percentage >= 90) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          {percentage}% Confiança
        </span>
      );
    }
    if (percentage >= 80) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {percentage}% Atenção
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
        {percentage}% Baixa Acurácia
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Document Simulation Canvas (Left side - 7 cols) */}
      <div className="lg:col-span-7 glass-panel p-4 rounded-xl border border-brand-border flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Documento de Origem & Bounding Boxes (OCR)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {provision.document.fileName} ({provision.document.fileSize})
            </span>
          </div>

          {/* Rendered Document Sheet */}
          <div className="mt-3 bg-slate-900 border border-slate-700/80 rounded-lg p-5 relative overflow-hidden font-mono text-xs shadow-inner min-h-[380px]">
            {/* Header of Invoice */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">EMISSOR / PRESTADOR</span>
                <div
                  onMouseEnter={() => setHighlightedField('vendor')}
                  onMouseLeave={() => setHighlightedField(null)}
                  className={`cursor-pointer transition-all p-1 rounded ${
                    highlightedField === 'vendor' ? 'bg-emerald-500/30 ring-1 ring-emerald-400' : 'bg-slate-800/60'
                  }`}
                >
                  <strong className="text-emerald-300">{provision.vendor.rawText}</strong>
                </div>
                <div
                  onMouseEnter={() => setHighlightedField('vendorCnpj')}
                  onMouseLeave={() => setHighlightedField(null)}
                  className={`mt-1 cursor-pointer transition-all p-0.5 rounded text-[11px] text-slate-400 ${
                    highlightedField === 'vendorCnpj' ? 'bg-emerald-500/30 ring-1 ring-emerald-400' : ''
                  }`}
                >
                  CNPJ: <span className="text-slate-200">{provision.vendorCnpj.rawText}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase">UNIDADE DESTINO (ATVOS)</span>
                <span className="text-white font-bold block">{provision.businessUnit.name}</span>
                <span className="text-slate-400 text-[11px]">Empresa SAP: {provision.businessUnit.companyCode} · Centro: {provision.businessUnit.plant}</span>
                <span className="text-emerald-400 text-[11px] block mt-1">Competência: {provision.competencia}</span>
              </div>
            </div>

            {/* Document Body */}
            <div className="py-4 space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">DISCRIMINAÇÃO DO SERVIÇO / MEDIÇÃO</span>
                <div
                  onMouseEnter={() => setHighlightedField('itemDescription')}
                  onMouseLeave={() => setHighlightedField(null)}
                  className={`p-2 rounded bg-slate-800/40 text-slate-300 leading-relaxed cursor-pointer transition-all ${
                    highlightedField === 'itemDescription' ? 'bg-emerald-500/30 ring-1 ring-emerald-400' : ''
                  }`}
                >
                  {provision.itemDescription.rawText}
                </div>
              </div>

              {/* Accounting Parameters in Document */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">CENTRO DE CUSTO INFORMADO</span>
                  <div
                    onMouseEnter={() => setHighlightedField('costCenter')}
                    onMouseLeave={() => setHighlightedField(null)}
                    className={`p-1.5 rounded bg-slate-800/60 text-slate-200 cursor-pointer transition-all flex items-center justify-between ${
                      highlightedField === 'costCenter' ? 'bg-emerald-500/30 ring-1 ring-emerald-400' : ''
                    }`}
                  >
                    <span>{provision.costCenter.rawText}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">CONTA CONTÁBIL / NATUREZA</span>
                  <div
                    onMouseEnter={() => setHighlightedField('glAccount')}
                    onMouseLeave={() => setHighlightedField(null)}
                    className={`p-1.5 rounded bg-slate-800/60 text-slate-200 cursor-pointer transition-all flex items-center justify-between ${
                      highlightedField === 'glAccount' ? 'bg-emerald-500/30 ring-1 ring-emerald-400' : ''
                    }`}
                  >
                    <span>{provision.glAccount.rawText}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Footer: Total Amount */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center bg-slate-950/70 p-3 rounded">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">CONTRATO / PEDIDO SAP</span>
                <span className="text-slate-300">{provision.contractOrPoNumber?.rawText || 'N/A'}</span>
              </div>
              <div
                onMouseEnter={() => setHighlightedField('grossAmount')}
                onMouseLeave={() => setHighlightedField(null)}
                className={`text-right p-1.5 rounded cursor-pointer transition-all ${
                  highlightedField === 'grossAmount' ? 'bg-emerald-500/30 ring-1 ring-emerald-400' : ''
                }`}
              >
                <span className="text-[10px] text-slate-500 block uppercase">VALOR BRUTO PROVISÃO</span>
                <span className="text-lg font-bold text-emerald-400">
                  {provision.grossAmount.rawText}
                </span>
              </div>
            </div>

            {/* Laser Scan Animation */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan opacity-40" />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-brand-border/40">
          <span>Formato: <strong className="text-slate-300">{provision.document.fileType}</strong></span>
          <span>Capturado via: <strong className="text-emerald-400">OCR Tesseract + LLM Parser</strong></span>
          <span>Ingerido em: <strong className="text-slate-300">{new Date(provision.document.uploadedAt).toLocaleTimeString()}</strong></span>
        </div>
      </div>

      {/* Structured Fields & Confidence Score Card (Right side - 5 cols) */}
      <div className="lg:col-span-5 glass-panel p-4 rounded-xl border border-brand-border flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
            <div className="flex items-center space-x-2">
              <Scan className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Campos Extraídos & Confidence Score
              </h3>
            </div>
            {getConfidenceBadge(provision.overallConfidence)}
          </div>

          <div className="mt-3 space-y-2.5">
            {/* Field 1: Vendor */}
            <div
              onMouseEnter={() => setHighlightedField('vendor')}
              onMouseLeave={() => setHighlightedField(null)}
              className={`p-2.5 rounded-lg border transition-all ${
                highlightedField === 'vendor' ? 'bg-brand-surfaceLight border-emerald-500' : 'bg-brand-surface border-brand-border/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-brand-muted uppercase font-bold flex items-center">
                  <Building className="w-3 h-3 mr-1 text-slate-400" /> Fornecedor
                </span>
                {getConfidenceBadge(provision.vendor.confidence)}
              </div>
              <div className="text-xs font-bold text-white mt-1">
                {provision.vendor.value}
              </div>
            </div>

            {/* Field 2: Vendor CNPJ */}
            <div
              onMouseEnter={() => setHighlightedField('vendorCnpj')}
              onMouseLeave={() => setHighlightedField(null)}
              className={`p-2.5 rounded-lg border transition-all ${
                highlightedField === 'vendorCnpj' ? 'bg-brand-surfaceLight border-emerald-500' : 'bg-brand-surface border-brand-border/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-brand-muted uppercase font-bold flex items-center">
                  <Hash className="w-3 h-3 mr-1 text-slate-400" /> CNPJ (LFA1)
                </span>
                {getConfidenceBadge(provision.vendorCnpj.confidence)}
              </div>
              <div className="text-xs font-mono text-emerald-300 mt-1 font-bold">
                {provision.vendorCnpj.value}
              </div>
            </div>

            {/* Field 3: Cost Center */}
            <div
              onMouseEnter={() => setHighlightedField('costCenter')}
              onMouseLeave={() => setHighlightedField(null)}
              className={`p-2.5 rounded-lg border transition-all ${
                highlightedField === 'costCenter' ? 'bg-brand-surfaceLight border-emerald-500' : 'bg-brand-surface border-brand-border/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-brand-muted uppercase font-bold flex items-center">
                  <Tag className="w-3 h-3 mr-1 text-slate-400" /> Centro de Custo (CSKS)
                </span>
                {getConfidenceBadge(provision.costCenter.confidence)}
              </div>
              <div className="text-xs font-mono text-slate-200 mt-1 font-bold flex items-center justify-between">
                <span>{provision.costCenter.value}</span>
                <span className="text-[11px] text-slate-400 font-sans font-normal truncate max-w-[160px]">{provision.costCenterName}</span>
              </div>
            </div>

            {/* Field 4: G/L Account */}
            <div
              onMouseEnter={() => setHighlightedField('glAccount')}
              onMouseLeave={() => setHighlightedField(null)}
              className={`p-2.5 rounded-lg border transition-all ${
                highlightedField === 'glAccount' ? 'bg-brand-surfaceLight border-emerald-500' : 'bg-brand-surface border-brand-border/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-brand-muted uppercase font-bold flex items-center">
                  <Landmark className="w-3 h-3 mr-1 text-slate-400" /> Conta Razão (SKA1)
                </span>
                {getConfidenceBadge(provision.glAccount.confidence)}
              </div>
              <div className="text-xs font-mono text-slate-200 mt-1 font-bold flex items-center justify-between">
                <span>{provision.glAccount.value}</span>
                <span className="text-[11px] text-slate-400 font-sans font-normal truncate max-w-[160px]">{provision.glAccountName}</span>
              </div>
            </div>

            {/* Field 5: Gross Amount */}
            <div
              onMouseEnter={() => setHighlightedField('grossAmount')}
              onMouseLeave={() => setHighlightedField(null)}
              className={`p-2.5 rounded-lg border transition-all ${
                highlightedField === 'grossAmount' ? 'bg-brand-surfaceLight border-emerald-500' : 'bg-brand-surface border-brand-border/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-brand-muted uppercase font-bold flex items-center">
                  <DollarSign className="w-3 h-3 mr-1 text-slate-400" /> Valor da Provisão
                </span>
                {getConfidenceBadge(provision.grossAmount.confidence)}
              </div>
              <div className="text-sm font-mono font-extrabold text-emerald-400 mt-1">
                R$ {provision.grossAmount.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Touchless Score Threshold: <strong className="text-slate-200">&ge; 90%</strong></span>
          <span className={provision.overallConfidence >= 0.90 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
            {provision.overallConfidence >= 0.90 ? 'Elegível Touchless' : 'Requer Verificação'}
          </span>
        </div>
      </div>
    </div>
  );
};
