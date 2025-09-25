/**
 * Constantes relacionadas às categorias de produtos
 */

export const PRODUCT_CATEGORIES = {
  FRUTAS: "Frutas",
  VERDURAS: "Verduras",
  LEGUMES: "Legumes",
  FOLHOSOS: "Folhosos",
  RAIZES: "Raízes",
  TUBERCULOS: "Tubérculos",
  VEGETAIS: "Vegetais",
  SEMENTES_E_GRAOS: "Sementes e Grãos",
  OLEAGINOSAS: "Oleaginosas",
  CEREAIS: "Cereais",
  ERVAS_E_TEMPEROS: "Ervas e Temperos",
  COGUMELOS: "Cogumelos e Fungos",
  BROTOS: "Brotos",
  FRUTAS_SECAS: "Frutas Secas e Desidratadas",
  EXOTICOS: "Exóticos / Tropicais",
  ORGANICOS: "Orgânicos",
  OUTROS: "Outros"
} as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[keyof typeof PRODUCT_CATEGORIES];

// Array para validação
export const PRODUCT_CATEGORIES_ARRAY = Object.values(PRODUCT_CATEGORIES) as ProductCategory[];