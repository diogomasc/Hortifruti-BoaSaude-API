import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { verifyJWT } from "../../middlewares/get-authenticated-user-from-request";
import { createAddressRoute } from "./create-address";
import { listAddressesRoute } from "./list-addresses";
import { updateAddressRoute } from "./update-address";
import { deleteAddressRoute } from "./delete-address";

export const addressesRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook("onRequest", verifyJWT);

  // GET /users/me/addresses → Lista os endereços do usuário autenticado
  app.register(listAddressesRoute);

  // POST /users/me/addresses → Cria um novo endereço vinculado ao usuário autenticado
  app.register(createAddressRoute);

  // PUT /users/me/addresses/{id} → Atualiza parcialmente um endereço
  app.register(updateAddressRoute);

  // DELETE /users/me/addresses/{id} → Deleta o endereço do usuário autenticado
  app.register(deleteAddressRoute);
};