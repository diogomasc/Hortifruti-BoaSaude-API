import { orders, orderItems } from "../database/schema";

export interface CreateOrderRequest {
  consumerId: string;
  deliveryAddressId: string;
  items: {
    productId: string;
    producerId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface OrderWithItems {
  id: string;
  consumerId: string;
  deliveryAddressId: string;
  status: "PENDING" | "COMPLETED" | "REJECTED" | "PARTIALLY_COMPLETED";
  totalAmount: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  items: {
    id: string;
    productId: string;
    producerId: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason: string | null;
    updatedAt: Date;
  }[];
}

export interface UpdateOrderItemStatusRequest {
  itemId: string;
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

export interface OrderItemWithProduct {
  id: string;
  orderId: string;
  productId: string;
  producerId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  updatedAt: Date;
  product: {
    id: string;
    title: string;
    description: string;
    price: string;
    category: string;
  };
  order: {
    id: string;
    consumerId: string;
    createdAt: Date;
  };
}

export interface OrdersRepository {
  create(data: CreateOrderRequest): Promise<OrderWithItems>;
  findById(id: string): Promise<OrderWithItems | null>;
  findByConsumerId(consumerId: string): Promise<OrderWithItems[]>;
  findByProducerId(producerId: string): Promise<OrderWithItems[]>;
  updateStatus(id: string, status: "PENDING" | "COMPLETED" | "REJECTED" | "PARTIALLY_COMPLETED"): Promise<void>;
  findAll(): Promise<OrderWithItems[]>;
  updateItemStatus(data: UpdateOrderItemStatusRequest): Promise<void>;
  findItemById(itemId: string): Promise<OrderItemWithProduct | null>;
  findPendingItemsByProducerId(producerId: string): Promise<OrderItemWithProduct[]>;
  recalculateOrderStatus(orderId: string): Promise<"PENDING" | "COMPLETED" | "REJECTED" | "PARTIALLY_COMPLETED">;
}