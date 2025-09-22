import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { verifyJWT } from "../../middlewares/get-authenticated-user-from-request";
import { getUserProfile, getUserProfileSchema } from "./get-profile";
import { updateUserProfile, updateUserProfileSchema } from "./update-profile";
import { toggleUserActiveStatus, toggleUserActiveStatusSchema } from "./toggle-active-status";
import { deleteUser, deleteUserSchema } from "./delete-user";
import { addressesRoutes } from "../addresses/routes";

export const usersRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook("onRequest", verifyJWT);

  // GET /users/me → Obtém todos os dados do usuário autenticado
  app.get("/me", { schema: getUserProfileSchema }, getUserProfile);

  // PUT /users/me → Atualiza dados do perfil completo
  app.put("/me", { schema: updateUserProfileSchema }, updateUserProfile);

  // PATCH /users/me/active → Alterna o estado isActive
  app.patch("/me/active", { schema: toggleUserActiveStatusSchema }, toggleUserActiveStatus);

  // DELETE /users/me → Deleta o usuário autenticado
  app.delete("/me", { schema: deleteUserSchema }, deleteUser);

  // Rotas de endereços
  app.register(addressesRoutes, { prefix: "/me/addresses" });
};
