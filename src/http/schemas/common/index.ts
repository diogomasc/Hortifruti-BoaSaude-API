import { z } from "zod";

// Schema para paginação (usado em múltiplos módulos)
export const paginationSchema = z.object({
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  hasNext: z.boolean(),
});

// Schema para resposta de erro simples (usado em múltiplos módulos)
export const errorResponseSchema = z.object({
  message: z.string(),
});

// Schema para resposta de erro de validação (usado principalmente em orders)
export const validationErrorResponseSchema = z.object({
  message: z.string(),
  errors: z
    .array(
      z.object({
        code: z.string(),
        expected: z.string().optional(),
        received: z.string().optional(),
        path: z.array(z.union([z.string(), z.number()])),
        message: z.string(),
      })
    )
    .optional(),
});

// Schema para parâmetros UUID (usado em múltiplos módulos)
export const uuidParamsSchema = z.object({
  id: z.string().uuid("ID deve ser um UUID válido"),
});

// Schemas de resposta de erro HTTP comuns
export const commonErrorResponses = {
  400: errorResponseSchema.describe("Dados inválidos"),
  401: errorResponseSchema.describe("Token não fornecido ou inválido"),
  403: errorResponseSchema.describe("Acesso negado"),
  404: errorResponseSchema.describe("Recurso não encontrado"),
  409: errorResponseSchema.describe("Conflito - recurso já existe"),
  500: errorResponseSchema.describe("Erro interno do servidor"),
};

// Schema para query de busca com paginação (usado em múltiplos módulos)
export const searchQuerySchema = z.object({
  search: z.string().optional().describe("Termo de busca"),
  limit: z.coerce.number().int().min(1).max(100).default(12).describe("Número máximo de itens por página"),
  offset: z.coerce.number().int().min(0).default(0).describe("Número de itens para pular"),
});