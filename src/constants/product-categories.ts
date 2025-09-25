/**
 * Constantes relacionadas às categorias de produtos
 */

export const PRODUCT_CATEGORIES = {
  FRUTAS: 'frutas',
  LEGUMES: 'legumes',
  VERDURAS: 'verduras',
  ERVAS: 'ervas',
  GRAOS: 'graos',
  TUBERCULOS: 'tuberculos',
  HORTALICAS: 'hortalicas',
  ORGANICOS: 'organicos',
  OVOS: 'ovos',
  MEL: 'mel',
  COGUMELOS: 'cogumelos',
  TEMPEROS: 'temperos',
  SEMENTES: 'sementes',
  CASTANHAS: 'castanhas',
  INTEGRAIS: 'integrais',
  CONSERVAS: 'conservas',
  COMPOTAS: 'compotas',
  POLPA_FRUTA: 'polpa_fruta',
  POLPA_VEGETAL: 'polpa_vegetal',
  SAZONAL: 'sazonal',
  FLORES_COMESTIVEIS: 'flores_comestiveis',
  VEGANO: 'vegano',
  KITS: 'kits',
  OUTROS: 'outros',
} as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[keyof typeof PRODUCT_CATEGORIES];

// Array para validação
export const PRODUCT_CATEGORIES_ARRAY = Object.values(PRODUCT_CATEGORIES) as ProductCategory[];