import type { FastifyReply, FastifyRequest } from "fastify";
import { verifyJWT } from "./get-authenticated-user-from-request";
import { UserRole } from "../../types";

export function verifyUserRole(role: UserRole) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    // Primeiro verifica se o usuário está autenticado (JWT válido)
    await verifyJWT(request, reply);

    // Se chegou até aqui, o usuário está autenticado
    // Agora verifica se tem o role necessário
    if (request.user?.role !== role) {
      return reply.status(403).send({
        message: `Acesso negado. Role ${role} necessária.`,
      });
    }
  };
}
