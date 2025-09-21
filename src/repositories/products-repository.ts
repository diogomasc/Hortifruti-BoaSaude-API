export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  producerId: string;
  quantity: number;
  createdAt: Date;
  images: ProductImage[];
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
}

export interface CreateProductData {
  title: string;
  description: string;
  price: string;
  category: string;
  producerId: string;
  quantity: number;
}

export interface UpdateProductData {
  title?: string;
  description?: string;
  price?: string;
  category?: string;
  quantity?: number;
}

export interface ProductsSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  producerId?: string;
}

export interface ProductsRepository {
  create(data: CreateProductData): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findByProducerId(producerId: string): Promise<Product[]>;
  findMany(params: ProductsSearchParams): Promise<{
    products: Product[];
    total: number;
  }>;
  update(id: string, data: UpdateProductData): Promise<Product | null>;
  delete(id: string): Promise<void>;
}

export interface CreateProductImageData {
  productId: string;
  imageUrl: string;
}

export interface ProductImagesRepository {
  create(data: CreateProductImageData): Promise<ProductImage>;
  findById(id: string): Promise<ProductImage | null>;
  findByProductId(productId: string): Promise<ProductImage[]>;
  delete(id: string): Promise<void>;
}