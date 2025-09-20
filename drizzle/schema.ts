import { pgTable, uuid, text, uniqueIndex, unique, boolean, timestamp, date, foreignKey, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const addresses = pgTable("addresses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	street: text().notNull(),
	number: text(),
	complement: text(),
	city: text().notNull(),
	state: text().notNull(),
	country: text().notNull(),
	zipCode: text("zip_code"),
});

export const userAdmin = pgTable("user_admin", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	phone: text(),
}, (table) => [
	uniqueIndex("admin_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("user_admin_email_unique").on(table.email),
]);

export const userConsumer = pgTable("user_consumer", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	cpf: text().notNull(),
	phone: text(),
	birthDate: date("birth_date"),
}, (table) => [
	uniqueIndex("consumer_cpf_idx").using("btree", table.cpf.asc().nullsLast().op("text_ops")),
	uniqueIndex("consumer_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("user_consumer_email_unique").on(table.email),
	unique("user_consumer_cpf_unique").on(table.cpf),
]);

export const userProducer = pgTable("user_producer", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	cnpj: text().notNull(),
	shopName: text("shop_name").notNull(),
	shopDescription: text("shop_description"),
	phone: text(),
}, (table) => [
	uniqueIndex("producer_cnpj_idx").using("btree", table.cnpj.asc().nullsLast().op("text_ops")),
	uniqueIndex("producer_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("user_producer_email_unique").on(table.email),
	unique("user_producer_cnpj_unique").on(table.cnpj),
]);

export const wallets = pgTable("wallets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	producerId: uuid("producer_id").notNull(),
	balance: numeric({ precision: 10, scale:  2 }).default('0'),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("wallet_producer_idx").using("btree", table.producerId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.producerId],
			foreignColumns: [userProducer.id],
			name: "wallets_producer_id_user_producer_id_fk"
		}),
]);
