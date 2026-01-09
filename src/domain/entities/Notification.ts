export type NotificationType =
    | 'application_shortlisted'
    | 'application_rejected'
    | 'interview_scheduled'
    | 'interview_rescheduled'
    | 'reschedule_requested'
    | 'reschedule_responded'
    | 'offer_extended'
    | 'offer_accepted'
    | 'offer_declined'
    | 'counter_offer_submitted'
    | 'counter_offer_rejected'
    | 'new_message';

export interface NotificationProps {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    data?: Record<string, unknown>;
    createdAt: Date;
}

export class Notification {
    public readonly id: string;
    public readonly userId: string;
    public readonly type: NotificationType;
    public readonly title: string;
    public readonly message: string;
    public readonly read: boolean;
    public readonly data?: Record<string, unknown>;
    public readonly createdAt: Date;

    constructor(props: NotificationProps) {
        this.id = props.id;
        this.userId = props.userId;
        this.type = props.type;
        this.title = props.title;
        this.message = props.message;
        this.read = props.read;
        this.data = props.data;
        this.createdAt = props.createdAt;
    }

    static create(
        props: Omit<NotificationProps, 'id' | 'createdAt' | 'read'>
    ): Omit<NotificationProps, 'id'> {
        return {
            ...props,
            read: false,
            createdAt: new Date(),
        };
    }

    markAsRead(): Partial<NotificationProps> {
        return { read: true };
    }
}
