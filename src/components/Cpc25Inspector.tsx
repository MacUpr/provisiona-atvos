import React from 'react';
import { ProvisionRecord } from '../types/provision';
import { ShieldCheck, BookOpen, CheckCircle2, AlertTriangle, Scale, HelpCircle, FileText } from 'lucide-react';

interface Cpc25InspectorProps {
  provision: ProvisionRecord;
}

export const Cpc25Inspector: React.FC<Cpc25InspectorProps> = ({ provision }) => {
  const cpc25 = provision.cpc25;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-xl border border-brand-border shadow-card-dark">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-brand-border/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Inspetor Contábil CPC 25 / IAS 37
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Normas Internacionais IFRS
                </span>
              </div>
              <p className="text-xs text-brand-muted mt-0.5">
                Avaliação dos 3 critérios cumulativos para reconhecimento de provisões e passivos contingentes.
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs">
            <span className="text-slate-400">Classificação Resultante: </span>
            <strong className="text-emerald-400 font-mono">
              {cpc25.resultingClassification === 'PROVISAO_RECONHECIDA'
                ? 'PROVISÃO RECONHECIDA NO PASSIVO'
                : cpc25.resultingClassification}
            </strong>
          </div>
        </div>

        {/* 3 Core Criteria Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {cpc25.criteria.map((criterion, idx) => (
            <div
              key={criterion.id}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-teal-400 px-1.5 py-0.5 rounded bg-teal-950 border border-teal-800">
                    Critério {idx + 1} · {criterion.normativeReference}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-xs font-bold text-white">
                  {criterion.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 italic">
                  "{criterion.question}"
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-emerald-300 bg-emerald-950/20 p-2 rounded">
                <strong>Fundamentação Atvos:</strong> {criterion.justification}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Tree & Accounting Treatment Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Technical Opinion Box */}
        <div className="glass-panel p-5 rounded-xl border border-brand-border">
          <div className="flex items-center space-x-2 pb-3 border-b border-brand-border/60">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Parecer Técnico do Agente de Compliance
            </h3>
          </div>

          <div className="mt-3 space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              {cpc25.technicalOpinion}
            </p>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Probabilidade de Desembolso:</span>
                <span className="text-emerald-400 font-bold">Provável (&gt; 50%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Confiabilidade da Mensuração:</span>
                <span className="text-emerald-400 font-bold">Confiável (Medição Homologada)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tratamento Contábil SAP:</span>
                <span className="text-white font-bold">Débito em Despesa (40) / Crédito Passivo (50)</span>
              </div>
            </div>
          </div>
        </div>

        {/* CPC 25 Matrix Guide */}
        <div className="glass-panel p-5 rounded-xl border border-brand-border">
          <div className="flex items-center space-x-2 pb-3 border-b border-brand-border/60">
            <Scale className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Matriz Comparativa CPC 25 (Item 14 vs 27)
            </h3>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/40">
              <span className="text-xs font-bold text-emerald-400 block">
                1. Provisão Contábil (Provável &gt; 50%)
              </span>
              <span className="text-[11px] text-slate-300">
                Reconhecida no Balanço Patrimonial como obrigação presente e lançada via BAPI_ACC_DOCUMENT_POST.
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-950/10 border border-amber-500/30">
              <span className="text-xs font-bold text-amber-400 block">
                2. Passivo Contingente (Possível 10% a 50%)
              </span>
              <span className="text-[11px] text-slate-300">
                Não gera lançamento contábil patrimonial. Divulgado apenas em Notas Explicativas aos Auditores Independentes.
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-bold text-slate-400 block">
                3. Probabilidade Remota (&lt; 10%)
              </span>
              <span className="text-[11px] text-slate-500">
                Nenhum reconhecimento ou divulgação em nota explicativa é exigido pelas normas IFRS.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
