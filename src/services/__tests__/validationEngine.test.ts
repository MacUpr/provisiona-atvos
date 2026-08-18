import { describe, it, expect } from 'vitest';
import { ValidationEngineService } from '../validationEngine';
import { DEMO_SCENARIOS } from '../../data/mockScenarios';

describe('ValidationEngineService', () => {
  it('should validate a touchless-eligible provision successfully', () => {
    const scenario = DEMO_SCENARIOS[0]; // Cenário 1: Colheita Mecanizada (Touchless)
    const result = ValidationEngineService.runValidation(scenario.provision);

    expect(result.isValid).toBe(true);
    expect(result.ruleResults.length).toBeGreaterThan(0);
    expect(result.ruleResults.every(r => r.status === 'PASSED')).toBe(true);
    expect(result.requiredTier).toBe('TOUCHLESS_AUTO');
  });

  it('should detect invalid cost center and fail validation', () => {
    const scenario = DEMO_SCENARIOS[2]; // Cenário 3: Centro de Custo Inativo
    const result = ValidationEngineService.runValidation(scenario.provision);

    expect(result.isValid).toBe(false);
    expect(result.ruleResults.some(r => r.status === 'FAILED')).toBe(true);
  });

  it('should require director approval for high-value provisions', () => {
    const scenario = DEMO_SCENARIOS[1]; // Cenário 2: Manutenção Industrial (Alçada Diretoria)
    const result = ValidationEngineService.runValidation(scenario.provision);

    expect(result.requiredTier).toBe('FINANCIAL_DIRECTOR');
  });

  it('should generate CPC 25 evaluation for all provisions', () => {
    DEMO_SCENARIOS.forEach((scenario) => {
      const result = ValidationEngineService.runValidation(scenario.provision);
      expect(result.cpc25).toBeDefined();
      expect(result.cpc25.criteria.length).toBe(3);
    });
  });
});
