import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyStatic from "@fastify/static";
import fastifyCors from "@fastify/cors";
import { appRoutes } from "./http/routes";
import { env } from "./env";
import { join } from "path";
import { globalErrorHandler } from "./http/middlewares/global-error-handler";
import { ORDER_STATUS_ARRAY, ORDER_ITEM_STATUS_ARRAY, ORDER_ACTIONS_ARRAY } from "./constants/order-status";
import { USER_ROLES_ARRAY } from "./constants/user-roles";
import { PRODUCT_CATEGORIES_ARRAY } from "./constants/product-categories";
import { FREQUENCY_ARRAY } from "./constants/frequency";

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

  // CORS setup
  app.register(fastifyCors, {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  });

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
        schemas: {
          // Enums para melhor documentação
          OrderStatus: {
            type: "string",
            enum: ORDER_STATUS_ARRAY,
            description: "Status possíveis para um pedido. PENDING: Aguardando aprovação dos produtores. COMPLETED: Todos os itens foram aprovados e o pedido está completo. REJECTED: Pedido foi rejeitado. PARTIALLY_COMPLETED: Alguns itens foram aprovados, outros rejeitados. PAUSED: Pedido pausado pelo consumidor. CANCELLED: Pedido cancelado."
          },
          OrderItemStatus: {
            type: "string", 
            enum: ORDER_ITEM_STATUS_ARRAY,
            description: "Status possíveis para um item do pedido. PENDING: Aguardando aprovação do produtor. APPROVED: Item aprovado pelo produtor. REJECTED: Item rejeitado pelo produtor."
          },
          Frequency: {
            type: "string",
            enum: FREQUENCY_ARRAY,
            description: "Frequências disponíveis para pedidos recorrentes. WEEKLY: Semanal. BIWEEKLY: Quinzenal. MONTHLY: Mensal. QUARTERLY: Trimestral. CUSTOM: Personalizada."
          },
          OrderAction: {
            type: "string",
            enum: ORDER_ACTIONS_ARRAY,
            description: "Ações disponíveis para gerenciar um pedido. pause: Pausar pedido (apenas consumidor). resume: Retomar pedido pausado (apenas consumidor). cancel: Cancelar pedido (apenas consumidor)."
          },
          UserRole: {
            type: "string",
            enum: USER_ROLES_ARRAY,
            description: "Papéis de usuário no sistema. consumer: Consumidor que faz pedidos. producer: Produtor que fornece produtos. admin: Administrador do sistema."
          },
          ProductCategory: {
            type: "string",
            enum: PRODUCT_CATEGORIES_ARRAY,
            description: "Categorias de produtos disponíveis no sistema, organizadas por tipo de alimento."
          }
        }
      },
    },
    transform: jsonSchemaTransform,
  });

  app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
  });

  // Servir arquivos estáticos (imagens de produtos)
  app.register(fastifyStatic, {
    root: join(process.cwd(), "uploads"),
    prefix: "/uploads/",
  });

  // Checa os dados de entrada
  app.setValidatorCompiler(validatorCompiler);
  // Converte os dados de saída
  app.setSerializerCompiler(serializerCompiler);

  // Registrar middleware global de tratamento de erros
  app.setErrorHandler(globalErrorHandler);

  app.register(appRoutes);

  return app;
}
