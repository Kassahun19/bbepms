export const API_BASE_URL = typeof window !== 'undefined' ? '' : 'http://localhost:3000';

export const APP_CONFIG = {
  BANK_NAME: 'Bunna Bank S.C.',
  SYSTEM_NAME: 'Daily KPI Performance Management System (EPMS)',
  VERSION: '2.0.0',
  DEFAULT_FISCAL_YEAR: 'FY 2026/27',
  CURRENCY_CODE: 'ETB',
  STORAGE_KEYS: {
    AUTH_TOKEN: 'bunna_epms_token',
    AUTH_USER: 'bunna_epms_user',
    THEME: 'bunna_epms_theme',
    LOCALE: 'bunna_epms_locale'
  }
};
