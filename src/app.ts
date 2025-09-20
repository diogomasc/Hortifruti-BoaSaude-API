import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { appRoutes } from "./http/routes";
import { env } from "./env";

export function buildApp() {
  const app = Fastify({
    logger:
      env.NODE_ENV === "dev"
        ? {
            transport: {
              target: "pino-pretty",
              options: {
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
              },
            },
          }
        : false,
  }).withTypeProvider<ZodTypeProvider>();

  // Swagger setup
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Hortifruti Boa Saúde API",
        description:
          "API para gerenciar usuários, produtos e pedidos do sistema Hortifruti Boa Saúde",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
  });

  // Checa os dados de entrada
  app.setValidatorCompiler(validatorCompiler);
  // Converte os dados de saída
  app.setSerializerCompiler(serializerCompiler);

  app.register(appRoutes);

  return app;
}
