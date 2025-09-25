// Order-related types

export type OrderStatus = "PENDING" | "COMPLETED" | "REJECTED" | "PARTIALLY_COMPLETED" | "PAUSED" | "CANCELLED";
export type OrderItemStatus = "PENDING" | "APPROVED" | "REJECTED";
export type OrderFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "CUSTOM";

export interface OrderItem {
  id: string;
  productId: string;
  producerId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: OrderItemStatus;
  rejectionReason: string | null;
  updatedAt: Date;
}

export interface OrderItemWithProduct {
  id: string;
  orderId: string;
  productId: string;
  producerId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: OrderItemStatus;
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

export interface ConsumerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  cpf: string | null;
}

export interface AddressData {
  id: string;
  street: string;
  number: string | null;
  complement: string | null;
  city: string;
  state: string;
  country: string;
  zipCode: string | null;
}

export interface OrderWithItems {
  id: string;
  consumerId: string;
  consumer: ConsumerData;
  deliveryAddressId: string;
  deliveryAddress: AddressData;
  status: OrderStatus;
  totalAmount: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  // Campos de recorrência
  isRecurring: boolean;
  frequency: OrderFrequency | null;
  customDays: number | null;
  nextDeliveryDate: Date | null;
  pausedAt: Date | null;
  cancelledAt: Date | null;
  items: OrderItem[];
}

export interface CreateOrderData {
  consumerId: string;
  deliveryAddressId: string;
  items: {
    productId: string;
    producerId: string;
    quantity: number;
    unitPrice: number;
  }[];
  // Campos de recorrência
  isRecurring?: boolean;
  frequency?: OrderFrequency;
  customDays?: number;
}

export interface UpdateOrderItemStatusData {
  itemId: string;
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

export interface FindItemsByProducerIdParams {
  producerId: string;
  status?: OrderItemStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateOrderRecurrenceData {
  orderId: string;
  isRecurring?: boolean;
  frequency?: OrderFrequency | null;
  customDays?: number | null;
}

// Use case request/response types
export interface CreateOrderRequest {
  consumerId: string;
  deliveryAddressId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  // Campos de recorrência
  isRecurring?: boolean;
  frequency?: OrderFrequency;
  customDays?: number;
}

export interface CreateOrderResponse {
  order: OrderWithItems;
}

export interface GetOrderRequest {
  orderId: string;
  userId: string;
  userRole: "consumer" | "producer" | "admin";
}

export interface GetOrderResponse {
  order: OrderWithItems;
}

export interface ListOrdersRequest {
  userId: string;
  userRole: "consumer" | "producer" | "admin";
  status?: OrderStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListOrdersResponse {
  orders: OrderWithItems[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
  };
}

export interface ManageOrderRequest {
  orderId: string;
  consumerId: string;
  action?: "pause" | "resume" | "cancel";
  isRecurring?: boolean;
  frequency?: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "CUSTOM";
  customDays?: number;
}

export interface UpdateOrderItemStatusRequest {
  itemId: string;
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

export interface UpdateOrderItemStatusResponse {
  success: boolean;
  message: string;
}

export interface ListPendingOrderItemsRequest {
  producerId: string;
  status?: OrderItemStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListPendingOrderItemsResponse {
  items: OrderItemWithProduct[];
}