import { eq, ilike, and, count, desc } from "drizzle-orm";
import { db } from "../database/client";
import { products, productImages } from "../database/schema";
import type {
  Product,
  ProductImage,
  CreateProductData,
  UpdateProductData,
  ProductsSearchParams,
  ProductsRepository,
  ProductImagesRepository,
  CreateProductImageData,
} from "./products-repository";

function mapDrizzleProductToProduct(
  drizzleProduct: any,
  images: ProductImage[] = []
): Product {
  return {
    id: drizzleProduct.id,
    title: drizzleProduct.title,
    description: drizzleProduct.description,
    price: drizzleProduct.price,
    category: drizzleProduct.category,
    producerId: drizzleProduct.producerId,
    quantity: drizzleProduct.quantity,
    createdAt: drizzleProduct.createdAt,
    images,
  };
}

function mapDrizzleProductImageToProductImage(drizzleImage: any): ProductImage {
  return {
    id: drizzleImage.id,
    productId: drizzleImage.productId,
    imageUrl: drizzleImage.imageUrl,
  };
}

export class DrizzleProductsRepository implements ProductsRepository {
  async create(data: CreateProductData): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values({
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category as any,
        producerId: data.producerId,
        quantity: data.quantity,
      })
      .returning();

    return mapDrizzleProductToProduct(product, []);
  }

  async findById(id: string): Promise<Product | null> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!product) {
      return null;
    }

    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id));

    const mappedImages = images.map(mapDrizzleProductImageToProductImage);

    return mapDrizzleProductToProduct(product, mappedImages);
  }

  async findByProducerId(producerId: string): Promise<Product[]> {
    const productsData = await db
      .select()
      .from(products)
      .where(eq(products.producerId, producerId))
      .orderBy(desc(products.createdAt));

    const productsWithImages = await Promise.all(
      productsData.map(async (product) => {
        const images = await db
          .select()
          .from(productImages)
          .where(eq(productImages.productId, product.id));

        const mappedImages = images.map(mapDrizzleProductImageToProductImage);
        return mapDrizzleProductToProduct(product, mappedImages);
      })
    );

    return productsWithImages;
  }

  async findMany(params: ProductsSearchParams): Promise<{
    products: Product[];
    total: number;
  }> {
    const { page = 1, limit = 10, search, category, producerId } = params;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (search) {
      whereConditions.push(ilike(products.title, `%${search}%`));
    }

    if (category) {
      whereConditions.push(eq(products.category, category as any));
    }

    if (producerId) {
      whereConditions.push(eq(products.producerId, producerId));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Buscar produtos
    const productsData = await db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    // Contar total
    const [{ total }] = await db
      .select({ total: count() })
      .from(products)
      .where(whereClause);

    // Buscar imagens para cada produto
    const productsWithImages = await Promise.all(
      productsData.map(async (product) => {
        const images = await db
          .select()
          .from(productImages)
          .where(eq(productImages.productId, product.id));

        const mappedImages = images.map(mapDrizzleProductImageToProductImage);
        return mapDrizzleProductToProduct(product, mappedImages);
      })
    );

    return {
      products: productsWithImages,
      total: Number(total),
    };
  }

  async update(id: string, data: UpdateProductData): Promise<Product | null> {
    const [updatedProduct] = await db
      .update(products)
      .set({
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.price && { price: data.price }),
        ...(data.category && { category: data.category as any }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
      })
      .where(eq(products.id, id))
      .returning();

    if (!updatedProduct) {
      return null;
    }

    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id));

    const mappedImages = images.map(mapDrizzleProductImageToProductImage);

    return mapDrizzleProductToProduct(updatedProduct, mappedImages);
  }

  async delete(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }
}

export class DrizzleProductImagesRepository implements ProductImagesRepository {
  async create(data: CreateProductImageData): Promise<ProductImage> {
    const [image] = await db
      .insert(productImages)
      .values({
        productId: data.productId,
        imageUrl: data.imageUrl,
      })
      .returning();

    return mapDrizzleProductImageToProductImage(image);
  }

  async findById(id: string): Promise<ProductImage | null> {
    const [image] = await db
      .select()
      .from(productImages)
      .where(eq(productImages.id, id));

    if (!image) {
      return null;
    }

    return mapDrizzleProductImageToProductImage(image);
  }

  async findByProductId(productId: string): Promise<ProductImage[]> {
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId));

    return images.map(mapDrizzleProductImageToProductImage);
  }

  async delete(id: string): Promise<void> {
    await db.delete(productImages).where(eq(productImages.id, id));
  }
}
