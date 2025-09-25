import type { FastifyInstance } from "fastify";
import { registerRoute } from "./controllers/auth/register";
import { loginRoute } from "./controllers/auth/login";
import { profileRoute } from "./controllers/users/profile";
import { usersRoutes } from "./controllers/users/routes";
import { productsRoutes } from "./controllers/products/routes";
import { ordersRoutes } from "./controllers/orders/routes";


export async function appRoutes(app: FastifyInstance) {
  app.register(registerRoute);
  app.register(loginRoute);
  app.register(profileRoute);

  // Rotas de usuários
  app.register(usersRoutes, { prefix: "/users" });

  // Rotas de produtos
  app.register(productsRoutes);

  // Rotas de pedidos
  app.register(ordersRoutes, { prefix: "/orders" });


}
