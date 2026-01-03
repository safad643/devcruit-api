import { PlanLimits, DiscountType } from '../../domain/entities/Plan';

// Create Plan
export interface CreatePlanInput {
    name: string;
    description: string;
    price: number;
    currency: string;
    durationMonths: number;
    limits: PlanLimits;
    features: string[];
    displayOrder: number;
    isOffer: boolean;
    offerLabel?: string;
    discountType?: DiscountType;
    discountValue?: number;
}

export interface CreatePlanOutput {
    id: string;
    name: string;
    message: string;
}

// Update Plan
export interface UpdatePlanInput {
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    durationMonths?: number;
    limits?: PlanLimits;
    features?: string[];
    displayOrder?: number;
    isOffer?: boolean;
    offerLabel?: string;
    discountType?: DiscountType;
    discountValue?: number;
    isActive?: boolean;
}

export interface UpdatePlanOutput {
    id: string;
    name: string;
    message: string;
}

// Delete Plan
export interface DeletePlanOutput {
    id: string;
    message: string;
}

// List Plans
export interface ListPlansInput {
    activeOnly: boolean;
    page?: number;
    limit?: number;
}

export interface PlanListItem {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    durationMonths: number;
    limits: PlanLimits;
    features: string[];
    displayOrder: number;
    isActive: boolean;
    isOffer: boolean;
    offerLabel?: string;
    discountType?: DiscountType;
    discountValue?: number;
    finalPrice: number;  // Calculated after discount
}

export interface ListPlansOutput {
    plans: PlanListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Get Plan By Id
export interface GetPlanByIdOutput extends PlanListItem { }
