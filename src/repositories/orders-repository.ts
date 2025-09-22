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
  status: "PENDING" | "COMPLETED" | "REJECTED";
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
  }[];
}

export interface OrdersRepository {
  create(data: CreateOrderRequest): Promise<OrderWithItems>;
  findById(id: string): Promise<OrderWithItems | null>;
  findByConsumerId(consumerId: string): Promise<OrderWithItems[]>;
  findByProducerId(producerId: string): Promise<OrderWithItems[]>;
  updateStatus(id: string, status: "PENDING" | "COMPLETED" | "REJECTED"): Promise<void>;
  findAll(): Promise<OrderWithItems[]>;
}