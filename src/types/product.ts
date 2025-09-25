// Product-related types

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
}

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

export interface CreateProductImageData {
  productId: string;
  imageUrl: string;
}

// Use case request/response types
export interface CreateProductRequest {
  title: string;
  description: string;
  price: string;
  category: string;
  producerId: string;
  quantity: number;
}

export interface CreateProductResponse {
  product: Product;
}

export interface GetProductRequest {
  productId: string;
}

export interface GetProductResponse {
  product: Product;
}

export interface UpdateProductRequest {
  productId: string;
  producerId: string;
  title?: string;
  description?: string;
  price?: string;
  category?: string;
  quantity?: number;
}

export interface UpdateProductResponse {
  product: Product;
}

export interface DeleteProductRequest {
  productId: string;
  producerId: string;
}

export interface ListProductsRequest {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  producerId?: string;
}

export interface ListProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListProducerProductsRequest {
  producerId: string;
}

export interface ListProducerProductsResponse {
  products: Product[];
}

export interface AddProductImageRequest {
  productId: string;
  producerId: string;
  imageUrl: string;
}

export interface AddProductImageResponse {
  image: ProductImage;
}

export interface ListProductImagesRequest {
  productId: string;
  producerId: string;
}

export interface ListProductImagesResponse {
  images: ProductImage[];
}

export interface DeleteProductImageRequest {
  imageId: string;
  producerId: string;
}