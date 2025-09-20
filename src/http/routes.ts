import { FastifyInstance } from "fastify";
import { registerController } from "./contollers/register";

export async function appRoutes(app: FastifyInstance) {
  app.register(registerController);
}
