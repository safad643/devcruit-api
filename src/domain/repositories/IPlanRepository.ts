import { IGenericRepository } from './IGenericRepository';
import { Plan, PlanProps } from '../entities/Plan';

export type CreatePlanData = Omit<PlanProps, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>;
export type UpdatePlanData = Partial<Omit<PlanProps, 'id' | 'createdAt' | 'updatedAt'>>;

export interface IPlanRepository extends IGenericRepository<Plan, CreatePlanData, UpdatePlanData> {
    findActive(): Promise<Plan[]>;
    findAll(): Promise<Plan[]>;
    findAllPaginated(page: number, limit: number): Promise<Plan[]>;
    countAll(): Promise<number>;
}
