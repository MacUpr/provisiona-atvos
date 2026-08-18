import React, { useState } from 'react';
import {
  SAP_VENDORS_DB,
  SAP_COST_CENTERS_DB,
  SAP_GL_ACCOUNTS_DB,
  ATVOS_COMPANIES,
} from '../services/masterDataStore';
import { Database, X, Search, Building, Tag, Landmark, Factory, CheckCircle2, XCircle } from 'lucide-react';

interface MasterDataModalProps {
  onClose: () => void;
}

export const MasterDataModal: React.FC<MasterDataModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'VENDORS' | 'COST_CENTERS' | 'GL_ACCOUNTS' | 'PLANTS'>('COST_CENTERS');

  const filteredVendors = SAP_VENDORS_DB.filter(
    (v) =>
      v.name1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.stcd1.includes(searchTerm) ||
      v.lifnr.includes(searchTerm)
  );

  const filteredCostCenters = SAP_COST_CENTERS_DB.filter(
    (cc) =>
      cc.kostl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cc.ktext.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cc.responsibleManager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGlAccounts = SAP_GL_ACCOUNTS_DB.filter(
    (gl) =>
      gl.saknr.includes(searchTerm) ||
      gl.txt50.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-brand-border flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Dados Mestres SAP S/4HANA (Atvos)</h2>
              <p className="text-xs text-brand-muted">
                Tabelas mestres replicadas do ERP para validação na Camada 2 (Motor de Regras).
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

        {/* Tab Selector & Search Bar */}
        <div className="p-4 border-b border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('COST_CENTERS')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'COST_CENTERS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Centros de Custo (CSKS)</span>
            </button>
            <button
              onClick={() => setActiveTab('GL_ACCOUNTS')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'GL_ACCOUNTS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Plano Contas (SKA1)</span>
            </button>
            <button
              onClick={() => setActiveTab('VENDORS')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'VENDORS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Fornecedores (LFA1)</span>
            </button>
            <button
              onClick={() => setActiveTab('PLANTS')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center space-x-1.5 transition-all ${
                activeTab === 'PLANTS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Factory className="w-3.5 h-3.5" />
              <span>Unidades Atvos</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código, nome ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Content Table Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'COST_CENTERS' && (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                  <th className="py-2 px-2">Cód. KOSTL</th>
                  <th className="py-2 px-2 font-sans">Descrição Centro de Custo</th>
                  <th className="py-2 px-2">Empresa SAP</th>
                  <th className="py-2 px-2 font-sans">Gestor Responsável</th>
                  <th className="py-2 px-2 text-center">Status SAP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCostCenters.map((cc) => (
                  <tr key={cc.kostl} className="hover:bg-slate-900/60">
                    <td className="py-2.5 px-2 text-emerald-400 font-bold">{cc.kostl}</td>
                    <td className="py-2.5 px-2 font-sans text-slate-200 font-medium">{cc.ktext}</td>
                    <td className="py-2.5 px-2 text-slate-400">{cc.bukrs}</td>
                    <td className="py-2.5 px-2 font-sans text-slate-300">{cc.responsibleManager}</td>
                    <td className="py-2.5 px-2 text-center">
                      {cc.isActive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ATIVO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                          BLOQUEADO
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'GL_ACCOUNTS' && (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                  <th className="py-2 px-2">Conta Razão (SAKNR)</th>
                  <th className="py-2 px-2 font-sans">Denominação Contábil</th>
                  <th className="py-2 px-2 font-sans">Natureza Contábil</th>
                  <th className="py-2 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredGlAccounts.map((gl) => (
                  <tr key={gl.saknr} className="hover:bg-slate-900/60">
                    <td className="py-2.5 px-2 text-emerald-400 font-bold">{gl.saknr}</td>
                    <td className="py-2.5 px-2 font-sans text-slate-200 font-medium">{gl.txt50}</td>
                    <td className="py-2.5 px-2 font-sans text-slate-300">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${gl.accountType === 'EXPENSE' ? 'bg-blue-900/30 text-blue-300' : 'bg-purple-900/30 text-purple-300'}`}>
                        {gl.accountType === 'EXPENSE' ? 'Despesa Operacional' : 'Passivo de Provisão'}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">
                        ATIVA
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'VENDORS' && (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                  <th className="py-2 px-2">Cód. SAP (LIFNR)</th>
                  <th className="py-2 px-2 font-sans">Razão Social Fornecedor</th>
                  <th className="py-2 px-2">CNPJ / STCD1</th>
                  <th className="py-2 px-2 text-center">Status Lançamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredVendors.map((v) => (
                  <tr key={v.lifnr} className="hover:bg-slate-900/60">
                    <td className="py-2.5 px-2 text-slate-400">{v.lifnr}</td>
                    <td className="py-2.5 px-2 font-sans text-slate-200 font-medium">{v.name1}</td>
                    <td className="py-2.5 px-2 text-emerald-400">{v.stcd1}</td>
                    <td className="py-2.5 px-2 text-center">
                      {v.isActive && !v.blockedForPosting ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">
                          HABILITADO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-bold">
                          BLOQUEADO ERP
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'PLANTS' && (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                  <th className="py-2 px-2">Empresa (BUKRS)</th>
                  <th className="py-2 px-2 font-sans">Unidade Agroindustrial Atvos</th>
                  <th className="py-2 px-2">Planta (WERKS)</th>
                  <th className="py-2 px-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ATVOS_COMPANIES.map((comp) => (
                  <tr key={comp.code} className="hover:bg-slate-900/60">
                    <td className="py-2.5 px-2 text-emerald-400 font-bold">{comp.code}</td>
                    <td className="py-2.5 px-2 font-sans text-slate-200 font-medium">{comp.name}</td>
                    <td className="py-2.5 px-2 text-slate-300">{comp.plant}</td>
                    <td className="py-2.5 px-2 text-slate-400">{comp.state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
