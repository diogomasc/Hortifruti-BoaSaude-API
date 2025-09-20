import type { FastifyInstance } from "fastify";
import { registerController } from "./contollers/register";
import { loginController } from "./contollers/login";
import { profileController } from "./contollers/profile";

export async function appRoutes(app: FastifyInstance) {
  app.register(registerController);
  app.register(loginController);
  app.register(profileController);
}
