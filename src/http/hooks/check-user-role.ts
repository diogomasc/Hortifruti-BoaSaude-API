import type { FastifyRequest, FastifyReply } from "fastify";
import { getAuthenticatedUserFromRequest } from "../middlewares/get-authenticated-user-from-request";

export function checkUserRole(role: "consumer" | "producer" | "admin") {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = getAuthenticatedUserFromRequest(request);

      if (user.role !== role) {
        return reply.status(403).send({ 
          message: `Access denied. Required role: ${role}` 
        });
      }
    } catch (error) {
      return reply.status(401).send({ 
        message: "Authentication required" 
      });
    }
  };
}