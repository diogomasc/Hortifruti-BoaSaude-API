import { subscriptions } from "../database/schema";

export interface CreateSubscriptionRequest {
  consumerId: string;
  orderId: string;
  frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY";
  nextDeliveryDate: Date;
}

export interface SubscriptionData {
  id: string;
  consumerId: string;
  orderId: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY";
  nextDeliveryDate: Date;
  createdAt: Date;
  updatedAt: Date;
  pausedAt: Date | null;
  cancelledAt: Date | null;
}

export interface SubscriptionsRepository {
  create(data: CreateSubscriptionRequest): Promise<SubscriptionData>;
  findById(id: string): Promise<SubscriptionData | null>;
  findByConsumerId(consumerId: string): Promise<SubscriptionData[]>;
  findByOrderId(orderId: string): Promise<SubscriptionData | null>;
  findActiveSubscriptions(): Promise<SubscriptionData[]>;
  pause(id: string): Promise<void>;
  resume(id: string): Promise<void>;
  cancel(id: string): Promise<void>;
  updateNextDeliveryDate(id: string, nextDeliveryDate: Date): Promise<void>;
}