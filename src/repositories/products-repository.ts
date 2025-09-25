import {
  Product,
  ProductImage,
  CreateProductData,
  UpdateProductData,
  ProductsSearchParams,
  CreateProductImageData
} from '../types';

export interface ProductsRepository {
  create(data: CreateProductData): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findByProducerId(producerId: string): Promise<Product[]>;
  findMany(params: ProductsSearchParams): Promise<{
    products: Product[];
    total: number;
  }>;
  update(id: string, data: UpdateProductData): Promise<Product | null>;
  updateQuantity(id: string, quantity: number): Promise<Product | null>;
  delete(id: string): Promise<void>;
}

export interface ProductImagesRepository {
  create(data: CreateProductImageData): Promise<ProductImage>;
  findById(id: string): Promise<ProductImage | null>;
  findByProductId(productId: string): Promise<ProductImage[]>;
  delete(id: string): Promise<void>;
}