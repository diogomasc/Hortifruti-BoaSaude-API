import { z } from "zod";

/**
 * Interface para dados de recorrência
 */
export interface RecurrenceData {
  isRecurring: boolean;
  frequency?: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "CUSTOM";
  customDays?: number;
}

/**
 * Valida os dados de recorrência de acordo com as regras de negócio:
 * - isRecurring é obrigatório
 * - Se isRecurring for true, frequency é obrigatório
 * - Se frequency for CUSTOM, customDays é obrigatório e deve ser positivo
 * - Se isRecurring for false, frequency e customDays podem ser ignorados
 */
export function validateRecurrenceData(data: RecurrenceData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // isRecurring é sempre obrigatório
  if (data.isRecurring === undefined || data.isRecurring === null) {
    errors.push("isRecurring é obrigatório");
    return { isValid: false, errors };
  }

  // Se isRecurring for true, frequency é obrigatório
  if (data.isRecurring && !data.frequency) {
    errors.push("Para pedidos recorrentes, frequency é obrigatório");
  }

  // Se frequency for CUSTOM, customDays é obrigatório
  if (data.frequency === "CUSTOM") {
    if (!data.customDays) {
      errors.push("Para frequency CUSTOM, customDays é obrigatório");
    } else if (data.customDays <= 0) {
      errors.push("customDays deve ser um número positivo");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Schema Zod para validação de recorrência em criação de pedidos
 * isRecurring é obrigatório
 */
export const createOrderRecurrenceSchema = z
  .object({
    isRecurring: z.boolean(),
    frequency: z
      .enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "CUSTOM"])
      .optional(),
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
      if (data.frequency === "CUSTOM" && !data.customDays) {
        return false;
      }
      return true;
    },
    {
      message:
        "Para pedidos recorrentes, frequency é obrigatório. Para frequency CUSTOM, customDays é obrigatório.",
    }
  );

/**
 * Schema Zod para validação de recorrência em atualizações de pedidos
 * Todos os campos são opcionais
 */
export const updateOrderRecurrenceSchema = z
  .object({
    isRecurring: z.boolean().optional(),
    frequency: z
      .enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "CUSTOM"])
      .optional(),
    customDays: z
      .number()
      .int()
      .positive("Dias personalizados deve ser um número positivo")
      .optional(),
  })
  .refine(
    (data) => {
      // Se frequency for CUSTOM, customDays é obrigatório
      if (data.frequency === "CUSTOM" && !data.customDays) {
        return false;
      }
      return true;
    },
    {
      message: "Para frequency CUSTOM, customDays é obrigatório.",
    }
  );

/**
 * Função utilitária para normalizar dados de recorrência
 * Remove campos desnecessários quando isRecurring é false
 */
export function normalizeRecurrenceData(data: RecurrenceData): RecurrenceData {
  if (!data.isRecurring) {
    return {
      isRecurring: false,
      frequency: undefined,
      customDays: undefined,
    };
  }

  return data;
}