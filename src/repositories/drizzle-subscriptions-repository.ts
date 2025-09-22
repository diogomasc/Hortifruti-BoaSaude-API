import { eq, and } from "drizzle-orm";
import { db } from "../database/client";
import { subscriptions } from "../database/schema";
import { SubscriptionsRepository, CreateSubscriptionRequest, SubscriptionData } from "./subscriptions-repository";

export class DrizzleSubscriptionsRepository implements SubscriptionsRepository {
  async create(data: CreateSubscriptionRequest): Promise<SubscriptionData> {
    const [subscription] = await db
      .insert(subscriptions)
      .values({
        consumerId: data.consumerId,
        orderId: data.orderId,
        frequency: data.frequency,
        nextDeliveryDate: data.nextDeliveryDate,
      })
      .returning();

    return {
      id: subscription.id,
      consumerId: subscription.consumerId,
      orderId: subscription.orderId,
      status: subscription.status,
      frequency: subscription.frequency,
      nextDeliveryDate: subscription.nextDeliveryDate,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      pausedAt: subscription.pausedAt,
      cancelledAt: subscription.cancelledAt,
    };
  }

  async findById(id: string): Promise<SubscriptionData | null> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, id));

    if (!subscription) {
      return null;
    }

    return {
      id: subscription.id,
      consumerId: subscription.consumerId,
      orderId: subscription.orderId,
      status: subscription.status,
      frequency: subscription.frequency,
      nextDeliveryDate: subscription.nextDeliveryDate,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      pausedAt: subscription.pausedAt,
      cancelledAt: subscription.cancelledAt,
    };
  }

  async findByConsumerId(consumerId: string): Promise<SubscriptionData[]> {
    const userSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.consumerId, consumerId));

    return userSubscriptions.map((subscription) => ({
      id: subscription.id,
      consumerId: subscription.consumerId,
      orderId: subscription.orderId,
      status: subscription.status,
      frequency: subscription.frequency,
      nextDeliveryDate: subscription.nextDeliveryDate,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      pausedAt: subscription.pausedAt,
      cancelledAt: subscription.cancelledAt,
    }));
  }

  async findByOrderId(orderId: string): Promise<SubscriptionData | null> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.orderId, orderId));

    if (!subscription) {
      return null;
    }

    return {
      id: subscription.id,
      consumerId: subscription.consumerId,
      orderId: subscription.orderId,
      status: subscription.status,
      frequency: subscription.frequency,
      nextDeliveryDate: subscription.nextDeliveryDate,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      pausedAt: subscription.pausedAt,
      cancelledAt: subscription.cancelledAt,
    };
  }

  async findActiveSubscriptions(): Promise<SubscriptionData[]> {
    const activeSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.status, "ACTIVE"));

    return activeSubscriptions.map((subscription) => ({
      id: subscription.id,
      consumerId: subscription.consumerId,
      orderId: subscription.orderId,
      status: subscription.status,
      frequency: subscription.frequency,
      nextDeliveryDate: subscription.nextDeliveryDate,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      pausedAt: subscription.pausedAt,
      cancelledAt: subscription.cancelledAt,
    }));
  }

  async pause(id: string): Promise<void> {
    await db
      .update(subscriptions)
      .set({
        status: "PAUSED",
        pausedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, id));
  }

  async resume(id: string): Promise<void> {
    await db
      .update(subscriptions)
      .set({
        status: "ACTIVE",
        pausedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, id));
  }

  async cancel(id: string): Promise<void> {
    await db
      .update(subscriptions)
      .set({
        status: "CANCELLED",
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, id));
  }

  async updateNextDeliveryDate(id: string, nextDeliveryDate: Date): Promise<void> {
    await db
      .update(subscriptions)
      .set({
        nextDeliveryDate,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, id));
  }
}