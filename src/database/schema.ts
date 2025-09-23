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
  integer,
} from "drizzle-orm/pg-core";

// Enum para tipos de usuário
export const userRole = pgEnum("user_roles", ["consumer", "producer", "admin"]);

// Enum para categorias de produtos
export const productCategory = pgEnum("product_categories", [
  "frutas",
  "legumes",
  "verduras",
  "ervas",
  "graos",
  "tuberculos",
  "hortalicas",
  "organicos",
  "ovos",
  "mel",
  "cogumelos",
  "temperos",
  "sementes",
  "castanhas",
  "integrais",
  "conservas",
  "compotas",
  "polpa_fruta",
  "polpa_vegetal",
  "sazonal",
  "flores_comestiveis",
  "vegano",
  "kits",
  "outros",
]);

// Tabela unificada de Usuários
export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().defaultRandom(),
    email: text().notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRole().notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
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
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: uniqueIndex("wallet_user_idx").on(table.userId),
  })
);

// Tabela de Produtos
export const products = pgTable("products", {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  description: text().notNull(),
  price: numeric({ precision: 10, scale: 2 }).notNull(),
  category: productCategory().notNull(),
  producerId: uuid("producer_id")
    .notNull()
    .references(() => users.id),
  quantity: integer().notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Tabela de Imagens dos Produtos
export const productImages = pgTable("product_images", {
  id: uuid().primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
});

// Enum para status de pedidos
export const orderStatus = pgEnum("order_status", [
  "PENDING",
  "COMPLETED",
  "REJECTED",
  "PARTIALLY_COMPLETED",
  "PAUSED",
  "CANCELLED",
]);

// Enum para status de itens do pedido
export const orderItemStatus = pgEnum("order_item_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

// Enum para status de assinaturas
export const subscriptionStatus = pgEnum("subscription_status", [
  "ACTIVE",
  "PAUSED",
  "CANCELLED",
]);

// Enum para frequência de assinaturas
export const subscriptionFrequency = pgEnum("subscription_frequency", [
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "QUARTERLY",
]);

// Tabela de Pedidos
export const orders = pgTable("orders", {
  id: uuid().primaryKey().defaultRandom(),
  consumerId: uuid("consumer_id")
    .notNull()
    .references(() => users.id),
  deliveryAddressId: uuid("delivery_address_id")
    .notNull()
    .references(() => addresses.id),
  status: orderStatus().notNull().default("PENDING"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// Tabela de Itens do Pedido
export const orderItems = pgTable("order_items", {
  id: uuid().primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  producerId: uuid("producer_id")
    .notNull()
    .references(() => users.id),
  quantity: integer().notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  status: orderItemStatus().notNull().default("PENDING"),
  rejectionReason: text("rejection_reason"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Tabela de Assinaturas
export const subscriptions = pgTable("subscriptions", {
  id: uuid().primaryKey().defaultRandom(),
  consumerId: uuid("consumer_id")
    .notNull()
    .references(() => users.id),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  status: subscriptionStatus().notNull().default("ACTIVE"),
  frequency: subscriptionFrequency().notNull(),
  nextDeliveryDate: timestamp("next_delivery_date", {
    withTimezone: true,
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  pausedAt: timestamp("paused_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
});
