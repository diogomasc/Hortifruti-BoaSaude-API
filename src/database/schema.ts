import {
  pgTable,
  text,
  uniqueIndex,
  uuid,
  timestamp,
  boolean,
  date,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enum para tipos de usuário
export const userRole = pgEnum("user_roles", ["consumer", "producer", "admin"]);

// Tabela unificada de Usuários
export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRole().notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text(),
    
    // Campos específicos para consumidores
    cpf: text(), // obrigatório apenas para consumers
    birthDate: date("birth_date"),
    
    // Campos específicos para produtores
    cnpj: text(), // obrigatório apenas para producers
    shopName: text("shop_name"),
    shopDescription: text("shop_description"),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
    cpfIdx: uniqueIndex("users_cpf_idx").on(table.cpf),
    cnpjIdx: uniqueIndex("users_cnpj_idx").on(table.cnpj),
  })
);

// Tabela de Endereços
export const addresses = pgTable("addresses", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  street: text().notNull(),
  number: text(),
  complement: text(),
  city: text().notNull(),
  state: text().notNull(),
  country: text().notNull(),
  zipCode: text("zip_code"),
});

// Tabela de Carteiras (apenas para produtores)
export const wallets = pgTable(
  "wallets",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    balance: numeric({ precision: 10, scale: 2 }).default("0"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: uniqueIndex("wallet_user_idx").on(table.userId),
  })
);