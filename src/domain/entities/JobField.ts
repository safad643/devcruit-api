export type FieldType = 'category' | 'tech' | 'skill';

export interface JobFieldProps {
    id: string;
    type: FieldType;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export class JobField {
    public readonly id: string;
    public readonly type: FieldType;
    public readonly name: string;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor(props: JobFieldProps) {
        this.id = props.id;
        this.type = props.type;
        this.name = props.name;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    static create(
        props: Omit<JobFieldProps, 'id' | 'createdAt' | 'updatedAt'>
    ): Omit<JobFieldProps, 'id'> {
        const now = new Date();
        return {
            ...props,
            createdAt: now,
            updatedAt: now,
        };
    }
}
