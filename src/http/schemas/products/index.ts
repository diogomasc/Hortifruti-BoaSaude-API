import { z } from "zod";
import { errorResponseSchema, uuidParamsSchema, paginationSchema } from "../common";

// Enum para categorias de produtos
export const productCategoryEnum = z.enum([
  "frutas",
  "legumes",
  "verduras",
  "ervas",
  "graos",
  "tuberculos",
  "hortalicas",
  "organicos",
  "ovos",
  "mel",
  "cogumelos",
  "temperos",
  "sementes",
  "castanhas",
  "integrais",
  "conservas",
  "compotas",
  "polpa_fruta",
  "polpa_vegetal",
  "sazonal",
  "flores_comestiveis",
  "vegano",
  "kits",
  "outros",
]);

// Schema para imagem de produto
export const productImageSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  imageUrl: z.string(),
});

// Schema base para produto
export const productBaseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  price: z.string(),
  category: z.string(),
  producerId: z.string().uuid(),
  quantity: z.number(),
  createdAt: z.date(),
});

// Schema completo para produto com imagens
export const productCompleteSchema = productBaseSchema.extend({
  images: z.array(productImageSchema),
});

// Schema para parâmetros de produto
export const productParamsSchema = uuidParamsSchema;

// Schema para parâmetros de imagem de produto
export const productImageParamsSchema = z.object({
  id: z.string().uuid().describe("ID do produto"),
  imageId: z.string().uuid().describe("ID da imagem"),
});

// Schema para criar produto
export const createProductBodySchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  price: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      "Preço deve ser um valor decimal válido"
    ),
  category: productCategoryEnum,
  quantity: z
    .number()
    .int()
    .min(0, "Quantidade deve ser um número inteiro positivo"),
});

// Schema para atualizar produto
export const updateProductBodySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  category: productCategoryEnum.optional(),
  quantity: z.number().int().min(0).optional(),
});

// Schema para query de listagem de produtos públicos
export const listProductsQuerySchema = z.object({
  search: z.string().optional(),
  category: productCategoryEnum.optional(),
  producerId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  offset: z.coerce.number().int().min(0).default(0),
  sortByPrice: z.enum(["desc", "asc"]).optional().default("desc"),
});

// Schema para query de listagem de produtos do produtor
export const listProducerProductsQuerySchema = z.object({
  search: z.string().optional(),
  category: productCategoryEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  offset: z.coerce.number().int().min(0).default(0),
});

// Re-export pagination schema from common
export { paginationSchema } from "../common";

// Schemas de resposta
export const createProductResponseSchema = {
  201: z.object({
    product: productCompleteSchema,
  }),
  400: z.object({ message: z.string() }).describe("Dados inválidos"),
  401: z
    .object({ message: z.string() })
    .describe("Token não fornecido ou inválido"),
  403: z
    .object({ message: z.string() })
    .describe("Usuário não é um produtor"),
};

export const updateProductResponseSchema = {
  200: z.object({
    product: productCompleteSchema,
  }),
  400: z.object({ message: z.string() }).describe("Dados inválidos"),
  401: z
    .object({ message: z.string() })
    .describe("Token não fornecido ou inválido"),
  403: z
    .object({ message: z.string() })
    .describe("Produto não pertence ao usuário"),
  404: z
    .object({ message: z.string() })
    .describe("Produto não encontrado"),
};

export const deleteProductResponseSchema = {
  204: z.null().describe("Produto deletado com sucesso"),
  401: z
    .object({
      message: z.string(),
    })
    .describe("Token não fornecido ou inválido"),
  403: z
    .object({
      message: z.string(),
    })
    .describe("Produto não pertence ao usuário"),
  404: z
    .object({
      message: z.string(),
    })
    .describe("Produto não encontrado"),
};

export const getProductByIdResponseSchema = {
  200: z.object({
    product: productCompleteSchema,
  }),
  400: z.object({ message: z.string() }).describe("ID inválido"),
  404: z
    .object({
      message: z.string(),
    })
    .describe("Produto não encontrado"),
};

export const listProductsResponseSchema = {
  200: z.object({
    products: z.array(productCompleteSchema),
    total: z.number(),
  }),
  400: z
    .object({ message: z.string() })
    .describe("Parâmetros inválidos"),
};

export const listProducerProductsResponseSchema = {
  200: z.object({
    products: z.array(productCompleteSchema),
    pagination: paginationSchema,
  }),
  401: errorResponseSchema.describe("Token não fornecido ou inválido"),
  403: errorResponseSchema.describe("Usuário não é um produtor"),
  404: errorResponseSchema.describe("Usuário não encontrado"),
};

// Schemas para imagens de produtos
export const addProductImageResponseSchema = {
  201: z.object({
    image: productImageSchema,
  }),
  400: errorResponseSchema.describe("Dados inválidos ou limite de imagens excedido"),
  401: errorResponseSchema.describe("Token não fornecido ou inválido"),
  403: errorResponseSchema.describe("Produto não pertence ao usuário"),
  404: errorResponseSchema.describe("Produto não encontrado"),
  413: errorResponseSchema.describe("Arquivo muito grande (máximo 3MB)"),
};

export const deleteProductImageResponseSchema = {
  204: z.null().describe("Imagem deletada com sucesso"),
  401: errorResponseSchema.describe("Token não fornecido ou inválido"),
  403: errorResponseSchema.describe("Imagem não pertence ao usuário"),
  404: errorResponseSchema.describe("Imagem não encontrada"),
};

export const listProductImagesResponseSchema = {
  200: z.object({
    images: z.array(productImageSchema),
  }),
  401: errorResponseSchema.describe("Token não fornecido ou inválido"),
  403: errorResponseSchema.describe("Produto não pertence ao usuário"),
  404: errorResponseSchema.describe("Produto não encontrado"),
};