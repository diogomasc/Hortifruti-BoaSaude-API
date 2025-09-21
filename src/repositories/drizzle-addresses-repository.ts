import { eq } from "drizzle-orm";
import { db } from "../database/client";
import { addresses } from "../database/schema";
import type { Address, CreateAddressData, AddressesRepository } from "./addresses-repository";

export class DrizzleAddressesRepository implements AddressesRepository {
  private mapDrizzleAddressToAddress(drizzleAddress: any): Address {
    return {
      id: drizzleAddress.id,
      userId: drizzleAddress.userId,
      street: drizzleAddress.street,
      number: drizzleAddress.number || undefined,
      complement: drizzleAddress.complement || undefined,
      city: drizzleAddress.city,
      state: drizzleAddress.state,
      country: drizzleAddress.country,
      zipCode: drizzleAddress.zipCode || undefined,
    };
  }

  async findByUserId(userId: string): Promise<Address[]> {
    const addressList = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId));

    return addressList.map(this.mapDrizzleAddressToAddress);
  }

  async create(data: CreateAddressData): Promise<Address> {
    const [address] = await db
      .insert(addresses)
      .values({
        userId: data.userId,
        street: data.street,
        number: data.number || null,
        complement: data.complement || null,
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zipCode || null,
      })
      .returning();

    return this.mapDrizzleAddressToAddress(address);
  }

  async update(id: string, data: Partial<CreateAddressData>): Promise<Address> {
    const [address] = await db
      .update(addresses)
      .set({
        street: data.street,
        number: data.number || null,
        complement: data.complement || null,
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zipCode || null,
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