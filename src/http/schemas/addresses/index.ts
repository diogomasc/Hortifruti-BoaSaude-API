import { z } from "zod";
import { paginationSchema, errorResponseSchema, uuidParamsSchema, searchQuerySchema } from "../common";

// Base address schema
export const addressBaseSchema = z.object({
  street: z.string().min(1, "Rua é obrigatória").describe("Nome da rua"),
  number: z.string().min(1, "Número é obrigatório").describe("Número do endereço"),
  complement: z.string().optional().describe("Complemento do endereço"),
  city: z.string().min(1, "Cidade é obrigatória").describe("Nome da cidade"),
  state: z.string().min(1, "Estado é obrigatório").describe("Nome do estado"),
  country: z.string().min(1, "País é obrigatório").describe("Nome do país"),
  zipCode: z
    .string()
    .regex(/^\d+$/, "CEP deve conter apenas números")
    .length(8, "CEP deve ter 8 dígitos")
    .describe("CEP (apenas números)"),
});

// Complete address schema with ID and userId
export const addressCompleteSchema = addressBaseSchema.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
});

// Address params schema
export const addressParamsSchema = uuidParamsSchema;

// Create address body schema
export const createAddressBodySchema = addressBaseSchema;

// Update address body schema (all fields optional)
export const updateAddressBodySchema = z.object({
  street: z
    .string()
    .min(1, "Rua é obrigatória")
    .optional()
    .describe("Nome da rua"),
  number: z
    .string()
    .min(1, "Número é obrigatório")
    .optional()
    .describe("Número do endereço"),
  complement: z.string().optional().describe("Complemento do endereço"),
  city: z
    .string()
    .min(1, "Cidade é obrigatória")
    .optional()
    .describe("Nome da cidade"),
  state: z
    .string()
    .min(1, "Estado é obrigatório")
    .optional()
    .describe("Nome do estado"),
  country: z
    .string()
    .min(1, "País é obrigatório")
    .optional()
    .describe("Nome do país"),
  zipCode: z
    .string()
    .regex(/^\d+$/, "CEP deve conter apenas números")
    .min(8, "CEP deve ter pelo menos 8 dígitos")
    .max(8, "CEP deve ter no máximo 8 dígitos")
    .optional()
    .describe("CEP (apenas números)"),
});

// List addresses query schema
export const listAddressesQuerySchema = searchQuerySchema.extend({
  search: z.string().optional().describe("Buscar por rua, cidade, estado ou complemento"),
});

// Re-export pagination schema from common
export { paginationSchema } from "../common";

// Response schemas
export const createAddressResponseSchema = {
  201: z.object({
    address: addressCompleteSchema.omit({ userId: true }).extend({
      number: z.string().optional(),
      complement: z.string().optional(),
      zipCode: z.string(),
    }),
  }),
  400: errorResponseSchema.describe("Dados inválidos"),
  401: errorResponseSchema.describe("Token não fornecido ou inválido"),
};

export const updateAddressResponseSchema = {
  200: z.object({
    address: addressCompleteSchema.omit({ userId: true }),
  }),
  400: errorResponseSchema.describe("Dados inválidos"),
  401: errorResponseSchema.describe("Token não fornecido ou inválido"),
  404: errorResponseSchema.describe("Endereço não encontrado ou não pertence ao usuário"),
};

export const deleteAddressResponseSchema = {
  204: z.null().describe("Endereço deletado com sucesso"),
  401: errorResponseSchema.describe("Token não fornecido ou inválido"),
  404: errorResponseSchema.describe("Endereço não encontrado ou não pertence ao usuário"),
};

export const listAddressesResponseSchema = {
  200: z.object({
    addresses: z.array(
      addressCompleteSchema.omit({ userId: true }).extend({
        number: z.string().optional(),
        complement: z.string().optional(),
        zipCode: z.string().optional(),
      })
    ),
    pagination: paginationSchema,
  }),
  401: errorResponseSchema.describe("Token não fornecido ou inválido"),
};