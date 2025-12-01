import { ContainerModule } from 'inversify';
import { TYPES } from '../types';
import {
  ICheckCanMessageUseCase,
  ISendMessageUseCase,
  IGetConversationsUseCase,
  IGetMessagesUseCase,
  IMarkMessageAsReadUseCase,
  IGetConversationUseCase,
  IValidateConversationParticipantUseCase,
} from '../../application/use-cases/chat';
import {
  CheckCanMessageUseCase,
  SendMessageUseCase,
  GetConversationsUseCase,
  GetMessagesUseCase,
  MarkMessageAsReadUseCase,
  GetConversationUseCase,
  ValidateConversationParticipantUseCase,
} from '../../application/use-cases/chat';
import { ChatController } from '../../presentation/controllers/ChatController';

export const chatModule = new ContainerModule((bind) => {
  bind<ICheckCanMessageUseCase>(TYPES.CheckCanMessageUseCase).to(CheckCanMessageUseCase);
  bind<ISendMessageUseCase>(TYPES.SendMessageUseCase).to(SendMessageUseCase);
  bind<IGetConversationsUseCase>(TYPES.GetConversationsUseCase).to(GetConversationsUseCase);
  bind<IGetMessagesUseCase>(TYPES.GetMessagesUseCase).to(GetMessagesUseCase);
  bind<IMarkMessageAsReadUseCase>(TYPES.MarkMessageAsReadUseCase).to(MarkMessageAsReadUseCase);
  bind<IGetConversationUseCase>(TYPES.GetConversationUseCase).to(GetConversationUseCase);
  bind<IValidateConversationParticipantUseCase>(TYPES.ValidateConversationParticipantUseCase).to(
    ValidateConversationParticipantUseCase
  );
  bind<ChatController>(TYPES.ChatController).to(ChatController);
});

