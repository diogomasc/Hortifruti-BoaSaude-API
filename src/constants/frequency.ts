/**
 * Constantes relacionadas às frequências de pedidos
 */

export const FREQUENCY = {
  WEEKLY: 'WEEKLY',
  BIWEEKLY: 'BIWEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  CUSTOM: 'CUSTOM',
} as const;

export type Frequency = typeof FREQUENCY[keyof typeof FREQUENCY];

// Array para validação
export const FREQUENCY_ARRAY = Object.values(FREQUENCY) as Frequency[];

// Mapeamento de frequências para dias
export const FREQUENCY_DAYS_MAP = {
  [FREQUENCY.WEEKLY]: 7,
  [FREQUENCY.BIWEEKLY]: 14,
  [FREQUENCY.MONTHLY]: 30,
  [FREQUENCY.QUARTERLY]: 90,
} as const;