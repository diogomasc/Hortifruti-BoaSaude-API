/**
 * Constantes relacionadas aos papéis de usuário
 */

export const USER_ROLES = {
  CONSUMER: 'consumer',
  PRODUCER: 'producer',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Array para validação
export const USER_ROLES_ARRAY = Object.values(USER_ROLES) as UserRole[];