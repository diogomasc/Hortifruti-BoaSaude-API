import type { FastifyInstance } from "fastify";
import { registerController } from "./contollers/register";
import { loginController } from "./contollers/login";
import { profileController } from "./contollers/profile";
import { usersRoutes } from "./contollers/users/routes";
import { productsRoutes } from "./contollers/products/routes";

export async function appRoutes(app: FastifyInstance) {
  app.register(registerController);
  app.register(loginController);
  app.register(profileController);
  
  // Rotas de usuários
  app.register(usersRoutes, { prefix: "/users" });
  
  // Rotas de produtos
  app.register(productsRoutes);
}
