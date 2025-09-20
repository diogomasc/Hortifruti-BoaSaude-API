import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	wallets: {
		userProducer: r.one.userProducer({
			from: r.wallets.producerId,
			to: r.userProducer.id
		}),
	},
	userProducer: {
		wallets: r.many.wallets(),
	},
}))