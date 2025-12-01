export interface MessageProps {
  id: string;
  conversationId: string;
  senderId: string; // userId
  message: string;
  readAt: Date | null;
  createdAt: Date;
}

export class Message {
  public readonly id: string;
  public readonly conversationId: string;
  public readonly senderId: string;
  public readonly message: string;
  public readonly readAt: Date | null;
  public readonly createdAt: Date;

  constructor(props: MessageProps) {
    this.id = props.id;
    this.conversationId = props.conversationId;
    this.senderId = props.senderId;
    this.message = props.message;
    this.readAt = props.readAt;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<MessageProps, 'id' | 'createdAt' | 'readAt'>
  ): Omit<MessageProps, 'id'> {
    return {
      ...props,
      readAt: null,
      createdAt: new Date(),
    };
  }

  markAsRead(): MessageProps {
    return {
      ...this,
      readAt: new Date(),
    };
  }
}

