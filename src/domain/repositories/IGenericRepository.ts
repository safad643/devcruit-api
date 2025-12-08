export interface IGenericRepository<T, CreateProps, UpdateProps = Partial<CreateProps>> {
    findById(id: string): Promise<T | null>;
    create(data: CreateProps): Promise<T>;
    update(id: string, data: UpdateProps): Promise<T>;
    delete(id: string): Promise<void>;
}
