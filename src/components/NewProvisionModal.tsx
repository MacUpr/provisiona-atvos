import React, { useState } from 'react';
import { ProvisionRecord } from '../types/provision';
import { ATVOS_COMPANIES, SAP_COST_CENTERS_DB, SAP_GL_ACCOUNTS_DB, SAP_VENDORS_DB } from '../services/masterDataStore';
import { UploadCloud, X, FileText, CheckCircle2, Sparkles, Building, Hash, Tag, Landmark, DollarSign } from 'lucide-react';

interface NewProvisionModalProps {
  onClose: () => void;
  onIngestNewProvision: (provision: ProvisionRecord) => void;
}

export const NewProvisionModal: React.FC<NewProvisionModalProps> = ({
  onClose,
  onIngestNewProvision,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('Medicao_Servicos_Agricolas_NovaAlvorada_Ago26.pdf');
  const [companyCode, setCompanyCode] = useState('1100');
  const [vendorCnpj, setVendorCnpj] = useState('12.345.678/0001-90');
  const [vendorName, setVendorName] = useState('AGROSAFRA COLHEITA & LOGÍSTICA LTDA');
  const [costCenter, setCostCenter] = useState('CC-1100-AGR01');
  const [glAccount, setGlAccount] = useState('5101001');
  const [amount, setAmount] = useState('125400.00');
  const [itemDescription, setItemDescription] = useState('Provisão de tratos culturais e adubação foliar de cana-soca.');
  const [confidenceScore, setConfidenceScore] = useState(0.96);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const company = ATVOS_COMPANIES.find((c) => c.code === companyCode) || ATVOS_COMPANIES[1];
    const grossVal = parseFloat(amount) || 125400.0;
    const refNum = `PROV-2026-${company.code}-${Math.floor(100 + Math.random() * 900)}`;

    const newProvision: ProvisionRecord = {
      id: `PROV-CUSTOM-${Date.now()}`,
      referenceNumber: refNum,
      businessUnit: {
        code: `U-${company.code}`,
        name: company.name,
        cnpj: '09.876.543/0001-99',
        companyCode: company.code,
        plant: company.plant,
      },
      documentType: 'MEDICAO_COLHEITA',
      documentTitle: `Boletim de Medição - ${fileName.replace(/\.[^/.]+$/, '')}`,
      competencia: '2026-08',
      dueDate: '2026-09-15',
      vendor: {
        value: vendorName,
        rawText: vendorName,
        confidence: confidenceScore,
      },
      vendorCnpj: {
        value: vendorCnpj,
        rawText: vendorCnpj,
        confidence: confidenceScore + 0.02,
      },
      costCenter: {
        value: costCenter,
        rawText: costCenter,
        confidence: confidenceScore - 0.01,
      },
      costCenterName: SAP_COST_CENTERS_DB.find((cc) => cc.kostl === costCenter)?.ktext || '',
      glAccount: {
        value: glAccount,
        rawText: glAccount,
        confidence: confidenceScore - 0.02,
      },
      glAccountName: SAP_GL_ACCOUNTS_DB.find((gl) => gl.saknr === glAccount)?.txt50 || '',
      grossAmount: {
        value: grossVal,
        rawText: `R$ ${grossVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        confidence: confidenceScore + 0.01,
      },
      currency: 'BRL',
      itemDescription: {
        value: itemDescription,
        rawText: itemDescription.toUpperCase(),
        confidence: confidenceScore,
      },
      overallConfidence: confidenceScore,
      touchlessEligible: confidenceScore >= 0.90 && grossVal <= 200000,
      status: 'INGESTED',
      document: {
        id: `DOC-NEW-${Date.now()}`,
        fileName,
        fileType: 'PDF',
        fileSize: selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB` : '1.2 MB',
        uploadedAt: new Date().toISOString(),
        boundingBoxes: [
          { field: 'vendor', x: 10, y: 15, width: 45, height: 4, confidence: confidenceScore },
          { field: 'vendorCnpj', x: 60, y: 15, width: 30, height: 4, confidence: confidenceScore },
          { field: 'costCenter', x: 10, y: 35, width: 35, height: 4, confidence: confidenceScore },
          { field: 'glAccount', x: 55, y: 35, width: 35, height: 4, confidence: confidenceScore },
          { field: 'itemDescription', x: 10, y: 50, width: 80, height: 8, confidence: confidenceScore },
          { field: 'grossAmount', x: 65, y: 78, width: 25, height: 5, confidence: confidenceScore },
        ],
      },
      validationResults: [],
      cpc25: {
        hasPresentObligation: true,
        outflowProbability: 'PROBABLE_GT_50',
        hasReliableEstimate: true,
        resultingClassification: 'PROVISAO_RECONHECIDA',
        criteria: [
          {
            id: 'CPC-01',
            name: 'Obrigação Presente',
            question: 'Serviço executado na competência?',
            fulfilled: true,
            justification: 'Relatório assinado pelo fiscal de contrato.',
            normativeReference: 'CPC 25.14(a)',
          },
          {
            id: 'CPC-02',
            name: 'Saída Provável',
            question: 'Saída provável de recursos?',
            fulfilled: true,
            justification: 'Contraprestação do serviço comprovada.',
            normativeReference: 'CPC 25.14(b)',
          },
          {
            id: 'CPC-03',
            name: 'Estimativa Confiável',
            question: 'Valor mensurado com base em medição?',
            fulfilled: true,
            justification: 'Valor calculado a partir de taxa contratada.',
            normativeReference: 'CPC 25.14(c)',
          },
        ],
        technicalOpinion: 'Reconhecimento obrigatório de provisão contábil.',
        evaluatedBy: 'AI_COMPLIANCE_AGENT',
        evaluatedAt: new Date().toISOString(),
      },
      requiredApprovalTier: grossVal > 400000 ? 'FINANCIAL_DIRECTOR' : grossVal > 200000 ? 'CONTROLLER_MANAGER' : 'TOUCHLESS_AUTO',
      approvalStatus: {
        tier: 'TOUCHLESS_AUTO',
      },
      auditTrail: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Motor de Ingestão OCR/LLM (Camada 1)',
          actorRole: 'Intelligent Ingestion Agent',
          action: `CAPTURA DE ARQUIVO (${fileName})`,
          layer: 'CAMADA_1_CAPTURA',
          details: 'Documento submetido para a esteira em 4 camadas.',
          previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
          currentHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
          isAutomated: true,
        },
      ],
    };

    onIngestNewProvision(newProvision);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-brand-border flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ingestão de Novo Documento / Provisão</h2>
              <p className="text-xs text-brand-muted">
                Camada 1: Ingestão de arquivos com extração OCR e classificação contábil automática.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Dropzone */}
          <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-950/40 relative">
            <input
              type="file"
              accept=".pdf,.xlsx,.csv,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <UploadCloud className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <span className="text-xs font-bold text-white block">
              {selectedFile ? selectedFile.name : 'Arraste um PDF, Relatório de Medição ou Imagem'}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Formatos aceitos: PDF, Excel, Imagem digitalizada ou XML (Até 25MB)
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Parâmetros de Extração / Simulação
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Business Unit */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Unidade Atvos (Empresa SAP)
                </label>
                <select
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  {ATVOS_COMPANIES.map((comp) => (
                    <option key={comp.code} value={comp.code}>
                      {comp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vendor */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Fornecedor / CNPJ
                </label>
                <select
                  value={vendorCnpj}
                  onChange={(e) => {
                    setVendorCnpj(e.target.value);
                    const v = SAP_VENDORS_DB.find((item) => item.stcd1 === e.target.value);
                    if (v) setVendorName(v.name1);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  {SAP_VENDORS_DB.map((v) => (
                    <option key={v.stcd1} value={v.stcd1}>
                      {v.name1} ({v.stcd1})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cost Center */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Centro de Custo (CSKS)
                </label>
                <select
                  value={costCenter}
                  onChange={(e) => setCostCenter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  {SAP_COST_CENTERS_DB.map((cc) => (
                    <option key={cc.kostl} value={cc.kostl}>
                      {cc.kostl} - {cc.ktext}
                    </option>
                  ))}
                </select>
              </div>

              {/* G/L Account */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Conta Contábil (SKA1)
                </label>
                <select
                  value={glAccount}
                  onChange={(e) => setGlAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  {SAP_GL_ACCOUNTS_DB.filter((gl) => gl.accountType === 'EXPENSE').map((gl) => (
                    <option key={gl.saknr} value={gl.saknr}>
                      {gl.saknr} - {gl.txt50}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Valor da Provisão (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Confidence */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Score de Confiança OCR ({Math.round(confidenceScore * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.50"
                  max="1.00"
                  step="0.01"
                  value={confidenceScore}
                  onChange={(e) => setConfidenceScore(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 mt-2"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                Descrição do Serviço
              </label>
              <input
                type="text"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-brand-border flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-glow-green flex items-center space-x-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ingerir & Iniciar Validação</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
