import React, { useState } from 'react';
import { ProvisionRecord } from '../types/provision';
import { SapPostingResult } from '../types/sap';
import {
  CheckCircle2,
  Database,
  Lock,
  Copy,
  RotateCcw,
  Code2,
  Table,
  ShieldCheck,
  AlertOctagon,
  FileSpreadsheet,
  Layers,
  Terminal,
} from 'lucide-react';

interface SapPostingInspectorProps {
  provision: ProvisionRecord;
  onTestIdempotency: () => void;
  onExecuteReversal: () => void;
  isProcessing: boolean;
}

export const SapPostingInspector: React.FC<SapPostingInspectorProps> = ({
  provision,
  onTestIdempotency,
  onExecuteReversal,
  isProcessing,
}) => {
  const [activeView, setActiveView] = useState<'FB03' | 'BAPI_JSON' | 'REVERSAL'>('FB03');
  const sapResult = provision.sapResult;

  if (!sapResult) {
    return (
      <div className="glass-panel p-8 rounded-xl border border-brand-border text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center mb-3">
          <Database className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Aguardando Lançamento no SAP S/4HANA
        </h3>
        <p className="text-xs text-brand-muted max-w-md mx-auto mt-1">
          Complete a validação das camadas anteriores para gerar o payload BAPI idempotente e registrar o documento contábil no ERP.
        </p>
      </div>
    );
  }

  const header = sapResult.rawPayload.header;
  const items = sapResult.rawPayload.items;

  return (
    <div className="glass-panel p-5 rounded-xl border border-brand-border shadow-card-dark">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-brand-border/60">
        <div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Camada 4 · Documento Gravado no SAP S/4HANA (BAPI / RFC)
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              BELNR {sapResult.belnr}
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Lançamento idempotente gravado com sucesso. Chave de referência: <span className="text-emerald-300 font-mono">{sapResult.idempotencyHash}</span>
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveView('FB03')}
            className={`px-3 py-1 rounded-md font-medium flex items-center space-x-1.5 transition-all ${
              activeView === 'FB03' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Visão SAP GUI (FB03)</span>
          </button>
          <button
            onClick={() => setActiveView('BAPI_JSON')}
            className={`px-3 py-1 rounded-md font-medium flex items-center space-x-1.5 transition-all ${
              activeView === 'BAPI_JSON' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Payload BAPI</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeView === 'FB03' ? (
        <div className="mt-4">
          {/* SAP Document Header Box (BKPF) */}
          <div className="bg-slate-950 border border-slate-700/80 rounded-lg p-4 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <strong className="text-slate-200">SAP S/4HANA ERP</strong> · Transação FB03 (Exibir Documento Contábil)
              </span>
              <span className="text-emerald-400 font-bold">STATUS: GRAVADO & COMPENSADO</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Nº Documento (BELNR)</span>
                <span className="text-emerald-400 font-bold text-sm">{sapResult.belnr}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Empresa (BUKRS)</span>
                <span className="text-white font-bold">{header.bukrs} ({provision.businessUnit.code})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Exercício / Período</span>
                <span className="text-white font-bold">{header.gjahr} / {header.monat.toString().padStart(2, '0')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Tipo Doc. (BLART)</span>
                <span className="text-white font-bold">{header.blart} (Provisão Geral)</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Data Documento</span>
                <span className="text-slate-300">{header.bldat}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Data Lançamento</span>
                <span className="text-slate-300">{header.budat}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-500 uppercase block">Chave Idempotência (BKPF-XBLNR)</span>
                <span className="text-emerald-300 font-mono text-[11px] truncate block">{header.xblnr}</span>
              </div>
            </div>

            {/* Line Items Table (BSEG) */}
            <div className="mt-4 border-t border-slate-800 pt-3">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2">
                Partidas Individuais do Documento (Tabela BSEG)
              </span>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                      <th className="py-1.5 px-2">Itm</th>
                      <th className="py-1.5 px-2">ChL (BSCHL)</th>
                      <th className="py-1.5 px-2">Conta Razão (HKONT)</th>
                      <th className="py-1.5 px-2">Descrição da Conta</th>
                      <th className="py-1.5 px-2">C.Custo (KOSTL)</th>
                      <th className="py-1.5 px-2 text-right">Montante (WRBTR)</th>
                      <th className="py-1.5 px-2 text-center">D/C</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {items.map((item) => (
                      <tr key={item.buzei} className="hover:bg-slate-900/60">
                        <td className="py-2 px-2 text-slate-400">{item.buzei}</td>
                        <td className="py-2 px-2 font-bold text-white">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${item.bschl === '40' ? 'bg-blue-900/40 text-blue-300' : 'bg-emerald-900/40 text-emerald-300'}`}>
                            {item.bschl}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-emerald-300 font-bold">{item.hkont}</td>
                        <td className="py-2 px-2 text-slate-300 font-sans text-xs">{item.accountName}</td>
                        <td className="py-2 px-2 text-slate-400">{item.kostl || '-'}</td>
                        <td className="py-2 px-2 text-right font-bold text-white">
                          R$ {item.wrbtr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-2 text-center font-bold">
                          <span className={item.shkzg === 'S' ? 'text-blue-400' : 'text-emerald-400'}>
                            {item.shkzg === 'S' ? 'S (Débito)' : 'H (Crédito)'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-700 font-bold text-xs text-slate-200">
                      <td colSpan={5} className="py-2 px-2 text-right uppercase text-[10px] text-slate-400">
                        Saldo Contábil da Provisão (Partida Dobrada):
                      </td>
                      <td className="py-2 px-2 text-right text-emerald-400">
                        R$ 0,00 (Balanceado)
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs overflow-x-auto max-h-96">
            <div className="flex justify-between text-[11px] text-slate-500 mb-2 pb-2 border-b border-slate-800">
              <span>BAPI: BAPI_ACC_DOCUMENT_POST (SAP Integration Suite / RFC)</span>
              <span className="text-emerald-400">JSON Payload Serializer</span>
            </div>
            <pre className="text-emerald-300 text-[11px] leading-relaxed">
              {JSON.stringify(
                {
                  BAPI_NAME: 'BAPI_ACC_DOCUMENT_POST',
                  DOCUMENTHEADER: header,
                  ACCOUNTGL: items.map((i) => ({
                    ITEMNO_ACC: i.buzei,
                    GL_ACCOUNT: i.hkont,
                    BUS_ACT: 'RFBU',
                    DOC_TYPE: 'SA',
                    COSTCENTER: i.kostl,
                    ITEM_TEXT: i.sgtxt,
                  })),
                  CURRENCYAMOUNT: items.map((i) => ({
                    ITEMNO_ACC: i.buzei,
                    CURRENCY: header.waers,
                    AMT_DOCCUR: i.shkzg === 'H' ? -i.wrbtr : i.wrbtr,
                  })),
                  BAPIRET2: sapResult.bapiReturn,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}

      {/* Reversal / Idempotency Actions Footer */}
      <div className="mt-4 p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <Lock className="w-4 h-4 text-purple-400" />
          <span>
            Guardião de Idempotência Ativo: <strong className="text-white font-mono">{sapResult.idempotencyHash}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onTestIdempotency}
            disabled={isProcessing}
            className="px-3 py-1.5 text-xs font-semibold rounded bg-purple-600 hover:bg-purple-500 text-white flex items-center space-x-1.5 transition-all"
            title="Tenta reprocessar este mesmo documento para validar a rejeição automática"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Testar Duplicidade</span>
          </button>

          <button
            onClick={onExecuteReversal}
            disabled={isProcessing || provision.isReversed}
            className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center space-x-1.5 transition-all ${
              provision.isReversed
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-glow-amber'
            }`}
            title="Executa estorno contábil no SAP na virada da competência (FB08)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{provision.isReversed ? 'Estornado no SAP (FB08)' : 'Reverter no SAP (FB08)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
