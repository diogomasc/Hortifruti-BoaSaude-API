import { eq } from "drizzle-orm";
import { db } from "../database/client";
import { users } from "../database/schema";
import type { User, CreateUserData, UsersRepository } from "./users-repository";

export class DrizzleUsersRepository implements UsersRepository {
  private mapDrizzleUserToUser(drizzleUser: any): User {
    return {
      id: drizzleUser.id,
      email: drizzleUser.email,
      passwordHash: drizzleUser.passwordHash,
      role: drizzleUser.role,
      firstName: drizzleUser.firstName,
      lastName: drizzleUser.lastName,
      phone: drizzleUser.phone || undefined,
      cpf: drizzleUser.cpf || undefined,
      birthDate: drizzleUser.birthDate || undefined,
      cnpj: drizzleUser.cnpj || undefined,
      shopName: drizzleUser.shopName || undefined,
      shopDescription: drizzleUser.shopDescription || undefined,
      isActive: drizzleUser.isActive ?? true,
      createdAt: drizzleUser.createdAt,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user ? this.mapDrizzleUserToUser(user) : null;
  }

  async findByCpf(cpf: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.cpf, cpf))
      .limit(1);

    return user ? this.mapDrizzleUserToUser(user) : null;
  }

  async findByCnpj(cnpj: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.cnpj, cnpj))
      .limit(1);

    return user ? this.mapDrizzleUserToUser(user) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        cpf: data.cpf || null,
        birthDate: data.birthDate || null,
        cnpj: data.cnpj || null,
        shopName: data.shopName || null,
        shopDescription: data.shopDescription || null,
      })
      .returning();

    return this.mapDrizzleUserToUser(user);
  }
}
