import type { FastifyInstance } from "fastify";
import { registerController } from "./controllers/register";
import { loginController } from "./controllers/login";
import { profileController } from "./controllers/profile";
import { usersRoutes } from "./controllers/users/routes";
import { productsRoutes } from "./controllers/products/routes";
import { ordersRoutes } from "./controllers/orders/routes";
import { subscriptionsRoutes } from "./controllers/subscriptions/routes";

export async function appRoutes(app: FastifyInstance) {
  app.register(registerController);
  app.register(loginController);
  app.register(profileController);

  // Rotas de usuários
  app.register(usersRoutes, { prefix: "/users" });

  // Rotas de produtos
  app.register(productsRoutes);

  // Rotas de pedidos
  app.register(ordersRoutes, { prefix: "/orders" });

  // Rotas de assinaturas
  app.register(subscriptionsRoutes, { prefix: "/subscriptions" });
}
