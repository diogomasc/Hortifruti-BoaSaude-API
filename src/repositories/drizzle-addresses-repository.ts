import { eq, and } from "drizzle-orm";
import { db } from "../database/client";
import { addresses } from "../database/schema";
import type { Address, CreateAddressData } from "../types";
import type { AddressesRepository } from "./addresses-repository";

export class DrizzleAddressesRepository implements AddressesRepository {
  private mapDrizzleAddressToAddress(drizzleAddress: any): Address {
    return {
      id: drizzleAddress.id,
      userId: drizzleAddress.userId,
      street: drizzleAddress.street,
      number: drizzleAddress.number,
      complement: drizzleAddress.complement || undefined,
      city: drizzleAddress.city,
      state: drizzleAddress.state,
      country: drizzleAddress.country,
      zipCode: drizzleAddress.zipCode,
    };
  }

  async findById(id: string): Promise<Address | null> {
    const [address] = await db
      .select()
      .from(addresses)
      .where(eq(addresses.id, id));

    if (!address) {
      return null;
    }

    return this.mapDrizzleAddressToAddress(address);
  }

  async findByUserId(userId: string): Promise<Address[]> {
    const addressList = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId));

    return addressList.map(this.mapDrizzleAddressToAddress);
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Address | null> {
    const [address] = await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)));

    if (!address) {
      return null;
    }

    return this.mapDrizzleAddressToAddress(address);
  }

  async create(data: CreateAddressData): Promise<Address> {
    const [address] = await db
      .insert(addresses)
      .values({
        userId: data.userId,
        street: data.street,
        number: data.number,
        complement: data.complement || null,
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zipCode,
      })
      .returning();

    return this.mapDrizzleAddressToAddress(address);
  }

  async update(id: string, data: Partial<CreateAddressData>): Promise<Address> {
    const [address] = await db
      .update(addresses)
      .set({
        street: data.street,
        number: data.number,
        complement: data.complement || null,
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zipCode,
      })
      .where(eq(addresses.id, id))
      .returning();

    return this.mapDrizzleAddressToAddress(address);
  }

  async delete(id: string): Promise<void> {
    await db
      .delete(addresses)
      .where(eq(addresses.id, id));
  }
}