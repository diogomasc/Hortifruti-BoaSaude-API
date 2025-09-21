import type { FastifyReply, FastifyRequest } from "fastify";

export function ensureAuthenticated(request: FastifyRequest, reply: FastifyReply): string {
  if (!request.user) {
    reply.status(401).send({ message: "Unauthorized" });
    throw new Error("Unauthorized");
  }

  return request.user.sub;
}