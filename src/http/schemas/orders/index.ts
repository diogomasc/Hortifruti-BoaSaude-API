import { z } from "zod";
import { paginationSchema, errorResponseSchema, validationErrorResponseSchema } from "../common";
import { ORDER_STATUS_ARRAY, ORDER_ITEM_STATUS_ARRAY, FREQUENCY_ARRAY, ORDER_ACTIONS_ARRAY, FREQUENCY } from "../../../constants";

// Enums para status usando as constantes
export const orderStatusEnum = z.enum(ORDER_STATUS_ARRAY as [string, ...string[]]);
export const orderItemStatusEnum = z.enum(ORDER_ITEM_STATUS_ARRAY as [string, ...string[]]);
export const frequencyEnum = z.enum(FREQUENCY_ARRAY as [string, ...string[]]);

// Schema base do item do pedido
export const orderItemBaseSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  producerId: z.string().uuid(),
  quantity: z.number(),
  unitPrice: z.string(),
  totalPrice: z.string(),
});

// Schema completo do item do pedido (com produto opcional)
export const orderItemCompleteSchema = orderItemBaseSchema.extend({
  status: orderItemStatusEnum,
  rejectionReason: z.string().nullable(),
  updatedAt: z.string(),
  product: z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string(),
    price: z.string(),
    category: z.string(),
  }).optional(),
});

// Schema do item do pedido com produto obrigatório (para endpoints específicos)
export const orderItemWithProductSchema = orderItemBaseSchema.extend({
  status: orderItemStatusEnum,
  rejectionReason: z.string().nullable(),
  updatedAt: z.string(),
  product: z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string(),
    price: z.string(),
    category: z.string(),
  }),
});

// Schema base do pedido
export const orderBaseSchema = z.object({
  id: z.string().uuid(),
  consumerId: z.string().uuid(),
  deliveryAddressId: z.string().uuid(),
  totalAmount: z.string(),
  status: orderStatusEnum,
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().nullable(),
});

// Schema de recorrência
export const recurrenceSchema = z.object({
  isRecurring: z.boolean(),
  frequency: frequencyEnum.nullable(),
  customDays: z.number().nullable(),
  nextDeliveryDate: z.string().nullable(),
  pausedAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
});

// Schema completo do pedido (com recorrência e itens)
export const orderCompleteSchema = orderBaseSchema.merge(recurrenceSchema).extend({
  items: z.array(orderItemCompleteSchema),
});

// Schema simplificado do pedido (para create-order response)
export const orderSimpleSchema = orderBaseSchema.merge(recurrenceSchema).extend({
  items: z.array(orderItemBaseSchema),
});

// Schema para criação de pedido (body)
export const createOrderBodySchema = z
  .object({
    deliveryAddressId: z
      .string()
      .uuid("ID do endereço deve ser um UUID válido"),
    items: z
      .array(
        z.object({
          productId: z.string().uuid("ID do produto deve ser um UUID válido"),
          quantity: z
            .number()
            .int()
            .positive("Quantidade deve ser um número positivo"),
        })
      )
      .min(1, "Pelo menos um item deve ser fornecido"),
    // Campos de recorrência
    isRecurring: z.boolean(),
    frequency: frequencyEnum.optional(),
    customDays: z
      .number()
      .int()
      .positive("Dias personalizados deve ser um número positivo")
      .optional(),
  })
  .refine(
    (data) => {
      // Se isRecurring for true, frequency é obrigatório
      if (data.isRecurring && !data.frequency) {
        return false;
      }
      // Se frequency for CUSTOM, customDays é obrigatório
      if (data.frequency === FREQUENCY.CUSTOM && !data.customDays) {
        return false;
      }
      return true;
    },
    {
      message:
        "Para pedidos recorrentes, frequency é obrigatório. Para frequency CUSTOM, customDays é obrigatório.",
    }
  );

// Schema para gerenciamento de pedido (body)
export const manageOrderBodySchema = z
  .object({
    action: z
      .enum(ORDER_ACTIONS_ARRAY as [string, ...string[]], {
        message: "Ação deve ser pause, resume ou cancel",
      })
      .optional(),
    // Campos de recorrência (opcionais para atualização)
    isRecurring: z.boolean().optional(),
    frequency: frequencyEnum.optional(),
    customDays: z
      .number()
      .int()
      .positive("Dias personalizados deve ser um número positivo")
      .optional(),
  })
  .refine(
    (data) => {
      // Se frequency for CUSTOM, customDays é obrigatório
    if (data.frequency === FREQUENCY.CUSTOM && !data.customDays) {
      return false;
    }
      return true;
    },
    {
      message: "Para frequency CUSTOM, customDays é obrigatório.",
    }
  );

// Schema para atualização de status de item do pedido (body)
export const updateOrderItemStatusBodySchema = z
  .object({
    status: z.enum([ORDER_ITEM_STATUS_ARRAY[1], ORDER_ITEM_STATUS_ARRAY[2]] as [string, ...string[]], {
      message: "Status deve ser APPROVED ou REJECTED",
    }),
    rejectionReason: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === ORDER_ITEM_STATUS_ARRAY[2] && !data.rejectionReason) {
        return false;
      }
      return true;
    },
    {
      message: "Motivo da rejeição é obrigatório quando o status é REJECTED",
      path: ["rejectionReason"],
    }
  );

// Schema para parâmetros de query
export const listOrdersQuerySchema = z.object({
  status: orderStatusEnum.optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(12),
  offset: z.coerce.number().min(0).default(0),
});

export const listPendingOrderItemsQuerySchema = z.object({
  status: orderItemStatusEnum.optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(12),
  offset: z.coerce.number().min(0).default(0),
});

// Schema para parâmetros de rota
export const orderParamsSchema = z.object({
  orderId: z.string().uuid("ID do pedido deve ser um UUID válido"),
});

export const orderItemParamsSchema = z.object({
  orderId: z.string().uuid("ID do pedido deve ser um UUID válido"),
  itemId: z.string().uuid("ID do item deve ser um UUID válido"),
});

// Re-export common schemas
export { errorResponseSchema, validationErrorResponseSchema, paginationSchema } from "../common";

// Schemas de resposta específicos
export const createOrderResponseSchema = {
  201: z
    .object({
      order: orderSimpleSchema.extend({
        createdAt: z.date(),
        updatedAt: z.date(),
        completedAt: z.date().nullable(),
        nextDeliveryDate: z.date().nullable(),
        pausedAt: z.date().nullable(),
        cancelledAt: z.date().nullable(),
      }),
    })
    .describe("Pedido criado com sucesso"),
  400: validationErrorResponseSchema.describe("Dados inválidos ou erro de validação"),
  403: errorResponseSchema.describe("Acesso negado - apenas consumidores podem criar pedidos"),
  404: errorResponseSchema.describe("Recurso não encontrado (endereço ou produto)"),
  500: errorResponseSchema.describe("Erro interno do servidor"),
};

export const manageOrderResponseSchema = {
  200: errorResponseSchema.describe("Pedido gerenciado com sucesso"),
  400: validationErrorResponseSchema.describe("Dados inválidos ou erro de validação"),
  401: errorResponseSchema.describe("Token de autenticação inválido ou não fornecido"),
  403: errorResponseSchema.describe("Acesso negado - usuário não autorizado"),
  404: errorResponseSchema.describe("Pedido não encontrado"),
  500: errorResponseSchema.describe("Erro interno do servidor"),
};

export const listOrdersResponseSchema = {
  200: z
    .object({
      orders: z.array(orderCompleteSchema),
      pagination: paginationSchema,
    })
    .describe("Lista de pedidos com paginação"),
  401: errorResponseSchema.describe("Token de autenticação inválido ou não fornecido"),
  500: errorResponseSchema.describe("Erro interno do servidor"),
};

export const getOrderByIdResponseSchema = {
  200: z
    .object({
      order: orderCompleteSchema,
    })
    .describe("Detalhes do pedido"),
  401: errorResponseSchema.describe("Token de autenticação inválido ou não fornecido"),
  403: errorResponseSchema.describe("Acesso negado - usuário não autorizado"),
  404: errorResponseSchema.describe("Pedido não encontrado"),
  500: errorResponseSchema.describe("Erro interno do servidor"),
};

export const listPendingOrderItemsResponseSchema = {
  200: z
    .object({
      orders: z.array(
        z.object({
          orderId: z.string(),
          orderInfo: z.object({
            id: z.string(),
            consumerId: z.string(),
            createdAt: z.string(),
          }),
          items: z.array(orderItemWithProductSchema),
        })
      ),
      pagination: paginationSchema,
    })
    .describe("Lista de itens agrupados por pedido com paginação"),
  400: errorResponseSchema.describe("Dados inválidos"),
  401: errorResponseSchema.describe("Token de autenticação inválido ou não fornecido"),
  403: errorResponseSchema.describe("Acesso negado - apenas produtores podem acessar"),
  500: errorResponseSchema.describe("Erro interno do servidor"),
};

export const updateOrderItemStatusResponseSchema = {
  200: errorResponseSchema.describe("Status do item atualizado com sucesso"),
  400: errorResponseSchema.describe("Dados inválidos ou transição de status inválida"),
  401: errorResponseSchema.describe("Token de autenticação inválido ou não fornecido"),
  403: errorResponseSchema.describe("Acesso negado - apenas o produtor dono do item pode atualizar"),
  404: errorResponseSchema.describe("Item do pedido não encontrado"),
  500: errorResponseSchema.describe("Erro interno do servidor"),
};