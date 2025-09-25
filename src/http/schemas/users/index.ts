import { z } from "zod";
import { errorResponseSchema } from "../common";
import { USER_ROLES_ARRAY } from "../../../constants";

// Schema base do usuário
export const userBaseSchema = z.object({
  id: z.string().uuid().describe("ID único do usuário"),
  email: z.string().email().describe("Email do usuário"),
  firstName: z.string().describe("Primeiro nome"),
  lastName: z.string().describe("Sobrenome"),
  phone: z.string().optional().describe("Telefone do usuário"),
  role: z
    .enum(USER_ROLES_ARRAY as [string, ...string[]])
    .describe("Papel do usuário no sistema"),
  isActive: z.boolean().describe("Status de ativação da conta"),
  createdAt: z.date().describe("Data de criação da conta"),
});

// Schema de endereço
export const addressSchema = z.object({
  id: z.string().uuid(),
  street: z.string(),
  number: z.string().nullable(),
  complement: z.string().optional(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  zipCode: z.string().nullable(),
});

// Schema de wallet
export const walletSchema = z.object({
  id: z.string().uuid(),
  balance: z.string(),
  updatedAt: z.date(),
});

// Schema completo do usuário (para get-profile)
export const userCompleteSchema = userBaseSchema.extend({
  // Campos específicos por role
  cpf: z.string().nullable().optional().describe("CPF (apenas consumidores)"),
  birthDate: z
    .string()
    .nullable()
    .optional()
    .describe("Data de nascimento (apenas consumidores)"),
  cnpj: z.string().nullable().optional().describe("CNPJ (apenas produtores)"),
  shopName: z
    .string()
    .nullable()
    .optional()
    .describe("Nome da loja (apenas produtores)"),
  shopDescription: z
    .string()
    .nullable()
    .optional()
    .describe("Descrição da loja (apenas produtores)"),
  // Relacionamentos
  addresses: z
    .array(addressSchema)
    .describe("Endereços do usuário"),
  wallet: walletSchema
    .nullable()
    .optional()
    .describe("Carteira digital (apenas produtores)"),
});

// Schema simplificado do usuário (para update-profile response)
export const userSimpleSchema = userBaseSchema.extend({
  cpf: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  cnpj: z.string().nullable().optional(),
  shopName: z.string().nullable().optional(),
  shopDescription: z.string().nullable().optional(),
});

// Schema para atualização de perfil (body)
export const updateUserProfileBodySchema = z.object({
  email: z
    .string()
    .email("Email deve ter um formato válido")
    .optional()
    .describe("Novo email do usuário"),
  firstName: z
    .string()
    .min(1, "Nome é obrigatório")
    .optional()
    .describe("Primeiro nome"),
  lastName: z
    .string()
    .min(1, "Sobrenome é obrigatório")
    .optional()
    .describe("Sobrenome"),
  phone: z
    .string()
    .regex(/^\d+$/, "Telefone deve conter apenas números")
    .length(11, "Telefone deve ter 11 dígitos")
    .optional()
    .describe("Telefone com DDD (apenas números)"),
  cpf: z
    .string()
    .regex(/^\d+$/, "CPF deve conter apenas números")
    .length(11, "CPF deve ter 11 dígitos")
    .optional()
    .describe("CPF (apenas números, para consumidores)"),
  birthDate: z
    .string()
    .optional()
    .describe("Data de nascimento no formato YYYY-MM-DD"),
  cnpj: z
    .string()
    .regex(/^\d+$/, "CNPJ deve conter apenas números")
    .length(14, "CNPJ deve ter 14 dígitos")
    .optional()
    .describe("CNPJ (apenas números, para produtores)"),
  shopName: z
    .string()
    .min(1)
    .optional()
    .describe("Nome da loja (para produtores)"),
  shopDescription: z
    .string()
    .optional()
    .describe("Descrição da loja (para produtores)"),
});

// Re-export error response schema from common
export { errorResponseSchema } from "../common";

// Schemas de resposta específicos
export const getUserProfileResponseSchema = {
  200: z.object({
    user: userCompleteSchema,
  }),
  401: errorResponseSchema.describe("Token não fornecido ou inválido"),
  404: errorResponseSchema.describe("Usuário não encontrado"),
};

export const updateUserProfileResponseSchema = {
  200: z.object({
    user: userSimpleSchema,
  }),
  400: errorResponseSchema.describe("Dados inválidos"),
  401: errorResponseSchema.describe("Token não fornecido ou inválido"),
  404: errorResponseSchema.describe("Usuário não encontrado"),
  409: errorResponseSchema.describe("Email, CPF ou CNPJ já existe"),
};