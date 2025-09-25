import { eq } from "drizzle-orm";
import { db } from "../database/client";
import { wallets } from "../database/schema";
import type { Wallet, CreateWalletData } from "../types";
import type { WalletsRepository } from "./wallets-repository";

export class DrizzleWalletsRepository implements WalletsRepository {
  private mapDrizzleWalletToWallet(drizzleWallet: any): Wallet {
    return {
      id: drizzleWallet.id,
      userId: drizzleWallet.userId,
      balance: drizzleWallet.balance || "0",
      updatedAt: drizzleWallet.updatedAt,
    };
  }

  async findByUserId(userId: string): Promise<Wallet | null> {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);

    return wallet ? this.mapDrizzleWalletToWallet(wallet) : null;
  }

  async create(data: CreateWalletData): Promise<Wallet> {
    const [wallet] = await db
      .insert(wallets)
      .values({
        userId: data.userId,
        balance: data.balance || "0",
      })
      .returning();

    return this.mapDrizzleWalletToWallet(wallet);
  }

  async updateBalance(userId: string, balance: string): Promise<Wallet> {
    const [wallet] = await db
      .update(wallets)
      .set({ 
        balance,
        updatedAt: new Date()
      })
      .where(eq(wallets.userId, userId))
      .returning();

    return this.mapDrizzleWalletToWallet(wallet);
  }

  async delete(id: string): Promise<void> {
    await db
      .delete(wallets)
      .where(eq(wallets.id, id));
  }
}