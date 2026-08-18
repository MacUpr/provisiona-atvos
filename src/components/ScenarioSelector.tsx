import React from 'react';
import { DEMO_SCENARIOS, DemoScenario } from '../data/mockScenarios';
import { Sparkles, CheckCircle, AlertTriangle, FileSearch, RefreshCw, ChevronRight } from 'lucide-react';

interface ScenarioSelectorProps {
  selectedScenarioId: string;
  onSelectScenario: (scenario: DemoScenario) => void;
  onResetToInitialState: () => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  selectedScenarioId,
  onSelectScenario,
  onResetToInitialState,
}) => {
  return (
    <div className="glass-panel p-4 rounded-xl border border-brand-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-brand-border/60">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Cenários de Demonstração (PoC Atvos)
            </h2>
          </div>
          <p className="text-xs text-brand-muted">
            Selecione um caso real do agronegócio/bioenergia para avaliar o comportamento das 4 camadas automatizadas.
          </p>
        </div>

        <button
          onClick={onResetToInitialState}
          className="self-start sm:self-auto px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition-colors"
          title="Resetar estado da esteira para o início"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Resetar Esteira</span>
        </button>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3">
        {DEMO_SCENARIOS.map((scenario) => {
          const isSelected = scenario.id === selectedScenarioId;
          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              className={`text-left p-3 rounded-lg border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-brand-surfaceLight border-emerald-500 shadow-glow-green ring-1 ring-emerald-500/40'
                  : 'bg-brand-surface/60 border-brand-border/80 hover:border-slate-500 hover:bg-brand-surfaceLight/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scenario.badgeColor}`}>
                    {scenario.badge}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-glow-green animate-pulse" />
                  )}
                </div>

                <h3 className="text-xs font-bold text-white line-clamp-1">
                  {scenario.title}
                </h3>
                <p className="text-[11px] font-mono text-emerald-400 mt-0.5">
                  {scenario.unit}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {scenario.shortDescription}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-brand-border/40 flex items-center justify-between text-[10px] font-semibold">
                <span className="text-slate-400">R$ {scenario.provision.grossAmount.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className={`flex items-center ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                  Testar <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
