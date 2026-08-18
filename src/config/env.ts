/**
 * Centralized environment configuration.
 * All VITE_ prefixed env vars are exposed to the client at build time.
 */
export const ENV = {
  sap: {
    baseUrl: import.meta.env.VITE_SAP_BASE_URL || 'https://sap-s4hana.atvos.com/sap/opu/odata/sap/',
    client: import.meta.env.VITE_SAP_CLIENT || '100',
    systemId: import.meta.env.VITE_SAP_SYSTEM_ID || 'PRD',
  },
  features: {
    touchlessAuto: import.meta.env.VITE_FEATURE_TOUCHLESS_AUTO !== 'false',
    idempotencyGuard: import.meta.env.VITE_FEATURE_IDEMPOTENCY_GUARD !== 'false',
    cpc25StrictMode: import.meta.env.VITE_FEATURE_CPC25_STRICT_MODE === 'true',
    activeLearning: import.meta.env.VITE_FEATURE_ACTIVE_LEARNING !== 'false',
  },
  app: {
    mode: (import.meta.env.VITE_APP_MODE || 'demo') as 'demo' | 'staging' | 'production',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
} as const;
