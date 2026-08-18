import React from 'react';
import { ShieldCheck, Database, Layers, AlertCircle, RefreshCw, Cpu } from 'lucide-react';

interface HeaderProps {
  onOpenMasterData: () => void;
  onOpenExceptionQueue: () => void;
  onOpenNewProvision: () => void;
  exceptionCount: number;
  sapConnected: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMasterData,
  onOpenExceptionQueue,
  onOpenNewProvision,
  exceptionCount,
  sapConnected,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur-md border-b border-brand-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-glow-green">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-white">PROVISIONA</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ATVOS
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
                  v2.4 Enterprise PoC
                </span>
              </div>
              <p className="text-xs text-brand-muted hidden sm:block">
                Automação Inteligente de Provisões Contábeis com Integração SAP
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-brand-surface/80 p-1 rounded-lg border border-brand-border">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-brand-muted hover:text-white hover:bg-brand-surfaceLight'
              }`}
            >
              Esteira Operacional (4 Camadas)
            </button>
            <button
              onClick={() => setActiveTab('cockpit')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'cockpit'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-brand-muted hover:text-white hover:bg-brand-surfaceLight'
              }`}
            >
              Cockpit & Telemetria
            </button>
            <button
              onClick={() => setActiveTab('cpc25')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'cpc25'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-brand-muted hover:text-white hover:bg-brand-surfaceLight'
              }`}
            >
              Inspetor CPC 25 / IAS 37
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* SAP Health Indicator */}
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border text-xs">
              <span className={`w-2 h-2 rounded-full ${sapConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-300 font-mono hidden sm:inline">SAP S/4HANA</span>
              <span className="text-[10px] text-emerald-400 font-mono hidden md:inline">RFC: 18ms</span>
            </div>

            {/* Exception Queue Badge */}
            <button
              onClick={onOpenExceptionQueue}
              className="relative p-2 rounded-lg bg-brand-surface hover:bg-brand-surfaceLight border border-brand-border text-slate-300 hover:text-white transition-colors"
              title="Fila de Exceções (HITL)"
            >
              <AlertCircle className="w-4 h-4 text-amber-400" />
              {exceptionCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-bold text-black flex items-center justify-center">
                  {exceptionCount}
                </span>
              )}
            </button>

            {/* Master Data Explorer */}
            <button
              onClick={onOpenMasterData}
              className="p-2 rounded-lg bg-brand-surface hover:bg-brand-surfaceLight border border-brand-border text-slate-300 hover:text-white transition-colors hidden sm:flex items-center space-x-1 text-xs"
              title="Consultar Dados Mestres SAP Atvos"
            >
              <Database className="w-4 h-4 text-blue-400" />
              <span className="hidden md:inline">Dados Mestres</span>
            </button>

            {/* Nova Provisão */}
            <button
              onClick={onOpenNewProvision}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-xs shadow-glow-green transition-all flex items-center space-x-1.5"
            >
              <span>+ Ingerir Provisão</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
