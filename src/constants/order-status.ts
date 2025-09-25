/**
 * Constantes relacionadas aos status de pedidos e itens de pedidos
 */

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  PARTIALLY_COMPLETED: 'PARTIALLY_COMPLETED',
  PAUSED: 'PAUSED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const ORDER_ITEM_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type OrderItemStatus = typeof ORDER_ITEM_STATUS[keyof typeof ORDER_ITEM_STATUS];

// Arrays para validação
export const ORDER_STATUS_ARRAY = Object.values(ORDER_STATUS) as OrderStatus[];
export const ORDER_ITEM_STATUS_ARRAY = Object.values(ORDER_ITEM_STATUS) as OrderItemStatus[];

// Constantes para ações de gerenciamento de pedidos
export const ORDER_ACTIONS = {
  PAUSE: 'pause',
  RESUME: 'resume',
  CANCEL: 'cancel',
} as const;

export type OrderAction = typeof ORDER_ACTIONS[keyof typeof ORDER_ACTIONS];
export const ORDER_ACTIONS_ARRAY = Object.values(ORDER_ACTIONS) as OrderAction[];