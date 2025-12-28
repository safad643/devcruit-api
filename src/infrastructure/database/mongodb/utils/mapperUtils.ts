
export const toDate = (value: unknown): Date =>
    value instanceof Date ? value : new Date(value as string);


export const toDateOptional = (value: unknown): Date | undefined =>
    value ? toDate(value) : undefined;


export const toArray = <T>(value: T[] | undefined | null): T[] =>
    value ?? [];
