
export interface ConversationProps {
  id: string;
  participant1Id: string; // userId
  participant2Id: string; // userId
  companyId?: string; // For developer-HR chats, the company this conversation is related to
  lastMessageAt: Date;
  lastMessage?: string; // Preview of last message
  createdAt: Date;
  updatedAt: Date;
}

export class Conversation {
  public readonly id: string;
  public readonly participant1Id: string;
  public readonly participant2Id: string;
  public readonly companyId?: string;
  public readonly lastMessageAt: Date;
  public readonly lastMessage?: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: ConversationProps) {
    this.id = props.id;
    this.participant1Id = props.participant1Id;
    this.participant2Id = props.participant2Id;
    this.companyId = props.companyId;
    this.lastMessageAt = props.lastMessageAt;
    this.lastMessage = props.lastMessage;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<ConversationProps, 'id' | 'createdAt' | 'updatedAt' | 'lastMessageAt'> & {
      lastMessageAt?: Date;
    }
  ): Omit<ConversationProps, 'id'> {
    const now = new Date();
    return {
      ...props,
      lastMessageAt: props.lastMessageAt || now,
      createdAt: now,
      updatedAt: now,
    };
  }

  // Helper method to get the other participant's ID
  getOtherParticipantId(userId: string): string {
    if (this.participant1Id === userId) {
      return this.participant2Id;
    }
    if (this.participant2Id === userId) {
      return this.participant1Id;
    }
    throw new Error('User is not a participant in this conversation');
  }

  // Helper method to check if user is a participant
  isParticipant(userId: string): boolean {
    return this.participant1Id === userId || this.participant2Id === userId;
  }
}

