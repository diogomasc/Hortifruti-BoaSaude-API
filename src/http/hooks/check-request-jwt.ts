import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../../env";

type JWTPayload = {
  sub: string;
  role: "consumer" | "producer" | "admin";
};

export async function checkRequestJWT(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const token = request.headers.authorization;

  if (!token) {
    return reply.status(401).send();
  }

  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be set.");
  }

  try {
    const cleanToken = token.replace("Bearer ", "");
    const payload = jwt.verify(cleanToken, env.JWT_SECRET) as JWTPayload;

    request.user = payload;
  } catch {
    return reply.status(401).send();
  }
}