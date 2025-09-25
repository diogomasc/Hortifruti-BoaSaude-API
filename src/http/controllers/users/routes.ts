import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { verifyJWT } from "../../middlewares/get-authenticated-user-from-request";
import { getUserProfileRoute } from "./get-profile";
import { updateUserProfileRoute } from "./update-profile";
import { toggleUserActiveStatusRoute } from "./toggle-active-status";
import { deleteUserRoute } from "./delete-user";
import { addressesRoutes } from "../addresses/routes";

export const usersRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook("onRequest", verifyJWT);

  // GET /users/me → Obtém todos os dados do usuário autenticado
  app.register(getUserProfileRoute);

  // PUT /users/me → Atualiza dados do perfil completo
  app.register(updateUserProfileRoute);

  // PATCH /users/me/active → Alterna o estado isActive
  app.register(toggleUserActiveStatusRoute);

  // DELETE /users/me → Deleta o usuário autenticado
  app.register(deleteUserRoute);

  // Rotas de endereços
  app.register(addressesRoutes, { prefix: "/me/addresses" });
};
