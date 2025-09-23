import { eq, and } from "drizzle-orm";
import { db } from "../database/client";
import { orders, orderItems, users, products } from "../database/schema";
import { 
  OrdersRepository, 
  CreateOrderRequest, 
  OrderWithItems, 
  UpdateOrderItemStatusRequest,
  OrderItemWithProduct 
} from "./orders-repository";

export class DrizzleOrdersRepository implements OrdersRepository {
  async create(data: CreateOrderRequest): Promise<OrderWithItems> {
    return await db.transaction(async (tx) => {
      // Calcular o valor total
      const totalAmount = data.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );

      // Criar o pedido
      const [order] = await tx
        .insert(orders)
        .values({
          consumerId: data.consumerId,
          deliveryAddressId: data.deliveryAddressId,
          totalAmount: totalAmount.toString(),
        })
        .returning();

      // Criar os itens do pedido
      const orderItemsData = data.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        producerId: item.producerId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        totalPrice: (item.quantity * item.unitPrice).toString(),
      }));

      const createdItems = await tx
        .insert(orderItems)
        .values(orderItemsData)
        .returning();

      return {
        id: order.id,
        consumerId: order.consumerId,
        deliveryAddressId: order.deliveryAddressId,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        completedAt: order.completedAt,
        items: createdItems.map((item) => ({
          id: item.id,
          productId: item.productId,
          producerId: item.producerId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          status: item.status,
          rejectionReason: item.rejectionReason,
          updatedAt: item.updatedAt,
        })),
      };
    });
  }

  async findById(id: string): Promise<OrderWithItems | null> {
    const orderWithItems = await db
      .select({
        order: orders,
        item: orderItems,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(eq(orders.id, id));

    if (orderWithItems.length === 0) {
      return null;
    }

    const order = orderWithItems[0].order;
    const items = orderWithItems
        .filter((row) => row.item !== null)
        .map((row) => ({
          id: row.item!.id,
          productId: row.item!.productId,
          producerId: row.item!.producerId,
          quantity: row.item!.quantity,
          unitPrice: row.item!.unitPrice,
          totalPrice: row.item!.totalPrice,
          status: row.item!.status,
          rejectionReason: row.item!.rejectionReason,
          updatedAt: row.item!.updatedAt,
        }));

    return {
      id: order.id,
      consumerId: order.consumerId,
      deliveryAddressId: order.deliveryAddressId,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      completedAt: order.completedAt,
      items,
    };
  }

  async findByConsumerId(consumerId: string): Promise<OrderWithItems[]> {
    const ordersWithItems = await db
      .select({
        order: orders,
        item: orderItems,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(eq(orders.consumerId, consumerId));

    return this.groupOrdersWithItems(ordersWithItems);
  }

  async findByProducerId(producerId: string): Promise<OrderWithItems[]> {
    const ordersWithItems = await db
      .select({
        order: orders,
        item: orderItems,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(eq(orderItems.producerId, producerId));

    return this.groupOrdersWithItems(ordersWithItems);
  }

  async updateStatus(id: string, status: "PENDING" | "COMPLETED" | "REJECTED" | "PARTIALLY_COMPLETED"): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    await db.update(orders).set(updateData).where(eq(orders.id, id));
  }

  async findAll(): Promise<OrderWithItems[]> {
    const ordersWithItems = await db
      .select({
        order: orders,
        item: orderItems,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId));

    return this.groupOrdersWithItems(ordersWithItems);
  }

  private groupOrdersWithItems(ordersWithItems: any[]): OrderWithItems[] {
    const ordersMap = new Map<string, OrderWithItems>();

    for (const row of ordersWithItems) {
      const order = row.order;
      const item = row.item;

      if (!ordersMap.has(order.id)) {
        ordersMap.set(order.id, {
          id: order.id,
          consumerId: order.consumerId,
          deliveryAddressId: order.deliveryAddressId,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          completedAt: order.completedAt,
          items: [],
        });
      }

      if (item) {
        ordersMap.get(order.id)!.items.push({
          id: item.id,
          productId: item.productId,
          producerId: item.producerId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          status: item.status,
          rejectionReason: item.rejectionReason,
          updatedAt: item.updatedAt,
        });
      }
    }

    return Array.from(ordersMap.values());
  }

  async updateItemStatus(data: UpdateOrderItemStatusRequest): Promise<void> {
    const updateData: any = {
      status: data.status,
      updatedAt: new Date(),
    };

    if (data.rejectionReason) {
      updateData.rejectionReason = data.rejectionReason;
    }

    await db.update(orderItems).set(updateData).where(eq(orderItems.id, data.itemId));
  }

  async findItemById(itemId: string): Promise<OrderItemWithProduct | null> {
    const result = await db
      .select({
        item: orderItems,
        product: products,
        order: orders,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(orderItems.id, itemId));

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      id: row.item.id,
      orderId: row.item.orderId,
      productId: row.item.productId,
      producerId: row.item.producerId,
      quantity: row.item.quantity,
      unitPrice: row.item.unitPrice,
      totalPrice: row.item.totalPrice,
      status: row.item.status,
      rejectionReason: row.item.rejectionReason,
      updatedAt: row.item.updatedAt,
      product: {
        id: row.product.id,
        title: row.product.title,
        description: row.product.description,
        price: row.product.price,
        category: row.product.category,
      },
      order: {
        id: row.order.id,
        consumerId: row.order.consumerId,
        createdAt: row.order.createdAt,
      },
    };
  }

  async findPendingItemsByProducerId(producerId: string): Promise<OrderItemWithProduct[]> {
    const result = await db
      .select({
        item: orderItems,
        product: products,
        order: orders,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(
        eq(orderItems.producerId, producerId),
        eq(orderItems.status, "PENDING")
      ));

    return result.map((row) => ({
      id: row.item.id,
      orderId: row.item.orderId,
      productId: row.item.productId,
      producerId: row.item.producerId,
      quantity: row.item.quantity,
      unitPrice: row.item.unitPrice,
      totalPrice: row.item.totalPrice,
      status: row.item.status,
      rejectionReason: row.item.rejectionReason,
      updatedAt: row.item.updatedAt,
      product: {
        id: row.product.id,
        title: row.product.title,
        description: row.product.description,
        price: row.product.price,
        category: row.product.category,
      },
      order: {
        id: row.order.id,
        consumerId: row.order.consumerId,
        createdAt: row.order.createdAt,
      },
    }));
  }

  async recalculateOrderStatus(orderId: string): Promise<"PENDING" | "COMPLETED" | "REJECTED" | "PARTIALLY_COMPLETED"> {
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    if (items.length === 0) {
      return "PENDING";
    }

    const approvedItems = items.filter(item => item.status === "APPROVED");
    const rejectedItems = items.filter(item => item.status === "REJECTED");
    const pendingItems = items.filter(item => item.status === "PENDING");

    let newStatus: "PENDING" | "COMPLETED" | "REJECTED" | "PARTIALLY_COMPLETED";

    if (pendingItems.length > 0) {
      // Se ainda há itens pendentes, o pedido permanece PENDING
      newStatus = "PENDING";
    } else if (approvedItems.length === items.length) {
      // Todos os itens foram aprovados
      newStatus = "COMPLETED";
    } else if (rejectedItems.length === items.length) {
      // Todos os itens foram rejeitados
      newStatus = "REJECTED";
    } else {
      // Alguns aprovados, alguns rejeitados
      newStatus = "PARTIALLY_COMPLETED";
    }

    await this.updateStatus(orderId, newStatus);
    return newStatus;
  }
}