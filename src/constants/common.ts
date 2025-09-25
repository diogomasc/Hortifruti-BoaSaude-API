/**
 * Constantes comuns utilizadas em toda a aplicação
 */

// Direções de ordenação
export const ORDER_DIRECTION = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type OrderDirection = typeof ORDER_DIRECTION[keyof typeof ORDER_DIRECTION];
export const ORDER_DIRECTION_ARRAY = Object.values(ORDER_DIRECTION) as OrderDirection[];

// Ambientes de execução
export const NODE_ENV = {
  DEVELOPMENT: 'dev',
  TEST: 'test',
  PRODUCTION: 'production',
} as const;

export type NodeEnv = typeof NODE_ENV[keyof typeof NODE_ENV];
export const NODE_ENV_ARRAY = Object.values(NODE_ENV) as NodeEnv[];

// Constantes de autenticação
export const AUTH_CONSTANTS = {
  BEARER_PREFIX: 'Bearer ',
  TOKEN_TYPE: 'Bearer',
} as const;

// Constantes de paginação
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Constantes de validação
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'Este campo é obrigatório',
  INVALID_EMAIL: 'Email inválido',
  INVALID_UUID: 'UUID inválido',
  INVALID_TOKEN: 'Token inválido',
  UNAUTHORIZED: 'Não autorizado',
  FORBIDDEN: 'Acesso negado',
  NOT_FOUND: 'Recurso não encontrado',
} as const;