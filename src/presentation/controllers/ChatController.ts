import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../di/types';
import {
  ISendMessageUseCase,
  IGetConversationsUseCase,
  IGetMessagesUseCase,
  IMarkMessageAsReadUseCase,
  ICheckCanMessageUseCase,
  IGetConversationUseCase,
} from '../../application/use-cases/chat';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';
import {
  SendMessageInput,
  ConversationIdParams,
  GetMessagesQuery,
  MarkMessagesAsReadInput,
  UserIdParams,
} from '../schemas/chat.schema';

@injectable()
export class ChatController {
  constructor(
    @inject(TYPES.SendMessageUseCase) private sendMessageUseCase: ISendMessageUseCase,
    @inject(TYPES.GetConversationsUseCase) private getConversationsUseCase: IGetConversationsUseCase,
    @inject(TYPES.GetMessagesUseCase) private getMessagesUseCase: IGetMessagesUseCase,
    @inject(TYPES.MarkMessageAsReadUseCase) private markMessageAsReadUseCase: IMarkMessageAsReadUseCase,
    @inject(TYPES.CheckCanMessageUseCase) private checkCanMessageUseCase: ICheckCanMessageUseCase,
    @inject(TYPES.GetConversationUseCase) private getConversationUseCase: IGetConversationUseCase
  ) {}

  sendMessage = async (
    request: FastifyRequest<{ Body: SendMessageInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const senderId = request.user?.id as string;
    const senderRole = request.user?.role as string;

    const result = await this.sendMessageUseCase.execute({
      senderId,
      senderRole,
      receiverId: request.body.receiverId,
      message: request.body.message,
    });

    reply.status(HttpStatus.CREATED).send(wrapSuccess(result));
  };

  getConversations = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.user?.id as string;
    const result = await this.getConversationsUseCase.execute({ userId });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  getMessages = async (
    request: FastifyRequest<{ Params: ConversationIdParams; Querystring: GetMessagesQuery }>,
    reply: FastifyReply
  ): Promise<void> => {
    const userId = request.user?.id as string;
    const limit = request.query.limit ?? 10;
    const beforeDate = request.query.beforeDate ? new Date(request.query.beforeDate) : undefined;

    const result = await this.getMessagesUseCase.execute({
      conversationId: request.params.conversationId,
      limit,
      beforeDate: beforeDate && !isNaN(beforeDate.getTime()) ? beforeDate : undefined,
      userId,
    });

    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  markMessagesAsRead = async (
    request: FastifyRequest<{ Params: ConversationIdParams; Body: MarkMessagesAsReadInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const userId = request.user?.id as string;
    const result = await this.markMessageAsReadUseCase.execute({
      conversationId: request.params.conversationId,
      messageIds: request.body.messageIds,
      userId,
    });

    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  checkCanMessage = async (
    request: FastifyRequest<{ Params: UserIdParams }>,
    reply: FastifyReply
  ): Promise<void> => {
    const requesterId = request.user?.id as string;
    const requesterRole = request.user?.role as string;
    const result = await this.checkCanMessageUseCase.execute({
      requesterUserId: requesterId,
      requesterRole,
      targetUserId: request.params.userId,
    });

    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  getConversationWithUser = async (
    request: FastifyRequest<{ Params: UserIdParams }>,
    reply: FastifyReply
  ): Promise<void> => {
    const requesterId = request.user?.id as string;
    const result = await this.getConversationUseCase.execute({
      participant1Id: requesterId,
      participant2Id: request.params.userId,
    });

    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };
}

