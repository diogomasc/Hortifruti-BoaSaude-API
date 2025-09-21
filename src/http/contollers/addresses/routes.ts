import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { verifyJWT } from "../../middlewares/get-authenticated-user-from-request";
import { createAddress, createAddressSchema } from "./create-address";
import { listAddresses, listAddressesSchema } from "./list-addresses";
import { updateAddress, updateAddressSchema } from "./update-address";
import { deleteAddress, deleteAddressSchema } from "./delete-address";

export const addressesRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook("onRequest", verifyJWT);

  // GET /users/me/addresses → Lista todos os endereços do usuário autenticado
  app.get("/", { schema: listAddressesSchema }, listAddresses);

  // POST /users/me/addresses → Cria um novo endereço vinculado ao usuário autenticado
  app.post("/", { schema: createAddressSchema }, createAddress);

  // PUT /users/me/addresses/{id} → Atualiza parcialmente um endereço
  app.put("/:id", { schema: updateAddressSchema }, updateAddress);

  // DELETE /users/me/addresses/{id} → Deleta o endereço do usuário autenticado
  app.delete("/:id", { schema: deleteAddressSchema }, deleteAddress);
};