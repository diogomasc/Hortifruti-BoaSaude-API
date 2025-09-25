import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { ResourceNotFoundError } from "../../use-cases/errors/resource-not-found-error";
import { NotAllowedError } from "../../use-cases/errors/not-allowed-error";
import { UserAlreadyExistsError } from "../../use-cases/errors/user-already-exists-error";
import { InvalidCredentialsError } from "../../use-cases/errors/invalid-credentials-error";
import { InvalidRoleError } from "../../use-cases/errors/invalid-role-error";
import { InvalidStatusTransitionError } from "../../use-cases/errors/invalid-status-transition-error";
import { UnauthorizedError } from "../../use-cases/errors/unauthorized-error";
import { env } from "../../env";

interface ErrorResponse {
  message: string;
  errors?: Array<{
    code: string;
    path: (string | number)[];
    message: string;
  }>;
}

export async function globalErrorHandler(
  error: FastifyError | ZodError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log do erro para debugging (apenas em desenvolvimento)
  if (env.NODE_ENV === "dev") {
    console.error("Error caught by global handler:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
    });
  }

  // Tratamento de erros de validação do Zod
  if (error instanceof ZodError) {
    const errorResponse: ErrorResponse = {
      message: "Dados de entrada inválidos",
      errors: error.issues.map((err) => ({
        code: err.code,
        path: err.path.map(p => String(p)),
        message: err.message,
      })),
    };
    return reply.status(400).send(errorResponse);
  }

  // Tratamento de erros customizados da aplicação
  if (error instanceof ResourceNotFoundError) {
    return reply.status(404).send({
      message: error.message,
    });
  }

  if (error instanceof NotAllowedError || error instanceof UnauthorizedError) {
    return reply.status(403).send({
      message: error.message,
    });
  }

  if (error instanceof UserAlreadyExistsError) {
    return reply.status(409).send({
      message: error.message,
    });
  }

  if (error instanceof InvalidCredentialsError) {
    return reply.status(401).send({
      message: error.message,
    });
  }

  if (error instanceof InvalidRoleError) {
    return reply.status(403).send({
      message: error.message,
    });
  }

  if (error instanceof InvalidStatusTransitionError) {
    return reply.status(400).send({
      message: error.message,
    });
  }

  // Tratamento de erros do Fastify
  if ('statusCode' in error && error.statusCode) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  // Tratamento de erros genéricos
  if (error instanceof Error) {
    // Em produção, não expor detalhes do erro
    const message =
      env.NODE_ENV === "production"
        ? "Erro interno do servidor"
        : error.message;

    return reply.status(500).send({
      message,
    });
  }

  // Fallback para erros não tratados
  return reply.status(500).send({
    message: "Erro interno do servidor",
  });
}
