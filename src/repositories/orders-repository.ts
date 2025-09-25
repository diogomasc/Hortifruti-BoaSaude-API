import { orders, orderItems } from "../database/schema";
import {
  CreateOrderData,
  ConsumerData,
  AddressData,
  OrderWithItems,
  UpdateOrderItemStatusData,
  OrderItemWithProduct,
  FindItemsByProducerIdParams,
  UpdateOrderRecurrenceData,
  OrderStatus
} from '../types';

// Alias for backward compatibility
export type CreateOrderRequest = CreateOrderData;
export type UpdateOrderItemStatusRequest = UpdateOrderItemStatusData;

// Alias for backward compatibility
export type FindItemsByProducerIdRequest = FindItemsByProducerIdParams;
export type UpdateOrderRecurrenceRequest = UpdateOrderRecurrenceData;

export interface OrdersRepository {
  create(data: CreateOrderRequest): Promise<OrderWithItems>;
  findById(id: string): Promise<OrderWithItems | null>;
  findByConsumerId(consumerId: string): Promise<OrderWithItems[]>;
  findByProducerId(producerId: string): Promise<OrderWithItems[]>;
  findAll(): Promise<OrderWithItems[]>;
  updateStatus(id: string, status: OrderStatus): Promise<void>;
  updateItemStatus(data: UpdateOrderItemStatusRequest): Promise<void>;
  updateRecurrence(data: UpdateOrderRecurrenceRequest): Promise<void>;
  findItemById(itemId: string): Promise<OrderItemWithProduct | null>;
  findPendingItemsByProducerId(
    producerId: string
  ): Promise<OrderItemWithProduct[]>;
  findItemsByProducerId(
    data: FindItemsByProducerIdRequest
  ): Promise<OrderItemWithProduct[]>;
  recalculateOrderStatus(orderId: string): Promise<OrderStatus>;
}
