import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { makeUpdateOrderItemStatusUseCase } from "../../../../use-cases/factories/make-update-order-item-status-use-case";
import { ResourceNotFoundError } from "../../../../use-cases/errors/resource-not-found-error";
import { NotAllowedError } from "../../../../use-cases/errors/not-allowed-error";
import { InvalidStatusTransitionError } from "../../../../use-cases/errors/invalid-status-transition-error";

// Schema para documentação Swagger
export const updateOrderItemStatusSchema = {
  tags: ["Orders - Only Producer"],
  summary: "Atualizar status de item do pedido",
  description:
    "Atualiza o status de um item específico do pedido. Apenas o produtor dono do item pode aprovar ou rejeitar.",
  security: [{ bearerAuth: [] }],
  params: z.object({
    orderId: z.string().uuid("ID do pedido deve ser um UUID válido"),
    itemId: z.string().uuid("ID do item deve ser um UUID válido"),
  }),
  body: z
    .object({
      status: z.enum(["APPROVED", "REJECTED"], {
        message: "Status deve ser APPROVED ou REJECTED",
      }),
      rejectionReason: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.status === "REJECTED" && !data.rejectionReason) {
          return false;
        }
        return true;
      },
      {
        message: "Motivo da rejeição é obrigatório quando o status é REJECTED",
        path: ["rejectionReason"],
      }
    ),
  response: {
    200: z
      .object({
        message: z.string(),
      })
      .describe("Status do item atualizado com sucesso"),
    400: z
      .object({
        message: z.string(),
        errors: z
          .array(
            z.object({
              code: z.string(),
              expected: z.string().optional(),
              received: z.string().optional(),
              path: z.array(z.union([z.string(), z.number()])),
              message: z.string(),
            })
          )
          .optional(),
      })
      .describe("Dados inválidos ou transição de status inválida"),
    401: z
      .object({
        message: z.string(),
      })
      .describe("Token de autenticação inválido ou não fornecido"),
    403: z
      .object({
        message: z.string(),
      })
      .describe(
        "Acesso negado - apenas o produtor dono do item pode atualizar"
      ),
    404: z
      .object({
        message: z.string(),
      })
      .describe("Item do pedido não encontrado"),
    500: z
      .object({
        message: z.string(),
      })
      .describe("Erro interno do servidor"),
  },
};

export async function updateOrderItemStatus(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { orderId, itemId } = request.params as z.infer<
      typeof updateOrderItemStatusSchema.params
    >;
    const { status, rejectionReason } = request.body as z.infer<
      typeof updateOrderItemStatusSchema.body
    >;

    // Obter ID do usuário autenticado
    const producerId = request.user?.sub;

    if (!producerId) {
      return reply
        .status(401)
        .send({ message: "Token de autenticação inválido" });
    }

    // Instanciar use case
    const updateOrderItemStatusUseCase = makeUpdateOrderItemStatusUseCase();

    // Executar use case
    await updateOrderItemStatusUseCase.execute({
      itemId,
      producerId,
      status,
      rejectionReason,
    });

    return reply.status(200).send({
      message: "Status do item atualizado com sucesso",
    });
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply.status(404).send({
        message: "Item do pedido não encontrado",
      });
    }

    if (error instanceof NotAllowedError) {
      return reply.status(403).send({
        message:
          "Acesso negado. Apenas o produtor dono do item pode atualizar seu status",
      });
    }

    if (error instanceof InvalidStatusTransitionError) {
      return reply.status(400).send({
        message: "Transição de status inválida. O item não está mais pendente",
      });
    }

    if (error instanceof Error) {
      return reply.status(400).send({
        message: error.message,
      });
    }

    return reply.status(500).send({
      message: "Erro interno do servidor",
    });
  }
}
