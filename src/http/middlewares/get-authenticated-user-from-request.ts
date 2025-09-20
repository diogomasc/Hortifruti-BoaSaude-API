import type { FastifyReply, FastifyRequest } from "fastify";
import { verify } from "jsonwebtoken";
import { env } from "../../env";

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({ message: "Token not provided." });
    }

    const token = authHeader.replace("Bearer ", "");

    const decoded = verify(token, env.JWT_SECRET) as {
      sub: string;
      role: "consumer" | "producer" | "admin";
    };

    request.user = {
      sub: decoded.sub,
      role: decoded.role,
    };
  } catch (err) {
    return reply.status(401).send({ message: "Invalid token." });
  }
}

export function getAuthenticatedUserFromRequest(request: FastifyRequest) {
  const user = request.user;

  if (!user) {
    throw new Error("Invalid authentication");
  }

  return user;
}
