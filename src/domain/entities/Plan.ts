export interface PlanLimits {
    maxActiveJobs: number | null;    // null = unlimited
    maxTeamMembers: number | null;
}

export type DiscountType = 'percentage' | 'fixed';

export interface PlanProps {
    id: string;
    name: string;
    description: string;
    price: number;                   // In smallest currency unit (paise)
    currency: string;
    durationMonths: number;
    limits: PlanLimits;
    features: string[];              // Display-only feature list
    displayOrder: number;            // Sort order on frontend
    isActive: boolean;               // Soft delete/hide

    // Offer fields
    isOffer: boolean;
    offerLabel?: string;             // e.g., "December Special 🎄"
    discountType?: DiscountType;
    discountValue?: number;          // 20 for 20%, or 500 for ₹500 off

    createdAt: Date;
    updatedAt: Date;
}

export class Plan {
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;
    public readonly price: number;
    public readonly currency: string;
    public readonly durationMonths: number;
    public readonly limits: PlanLimits;
    public readonly features: string[];
    public readonly displayOrder: number;
    public readonly isActive: boolean;
    public readonly isOffer: boolean;
    public readonly offerLabel?: string;
    public readonly discountType?: DiscountType;
    public readonly discountValue?: number;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor(props: PlanProps) {
        this.id = props.id;
        this.name = props.name;
        this.description = props.description;
        this.price = props.price;
        this.currency = props.currency;
        this.durationMonths = props.durationMonths;
        this.limits = props.limits;
        this.features = props.features;
        this.displayOrder = props.displayOrder;
        this.isActive = props.isActive;
        this.isOffer = props.isOffer;
        this.offerLabel = props.offerLabel;
        this.discountType = props.discountType;
        this.discountValue = props.discountValue;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    static create(
        props: Omit<PlanProps, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>
    ): Omit<PlanProps, 'id'> {
        const now = new Date();
        return {
            ...props,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        };
    }

    /**
     * Calculate the final price after applying discount (if any)
     */
    getFinalPrice(): number {
        if (!this.isOffer || !this.discountType || !this.discountValue) {
            return this.price;
        }

        if (this.discountType === 'percentage') {
            const discount = Math.round(this.price * (this.discountValue / 100));
            return Math.max(0, this.price - discount);
        }

        // Fixed discount
        return Math.max(0, this.price - this.discountValue);
    }

    /**
     * Create a snapshot of this plan for storage in PlanHistoryItem
     */
    toSnapshot(): {
        planName: string;
        price: number;
        finalPrice: number;
        durationMonths: number;
        limits: PlanLimits;
    } {
        return {
            planName: this.name,
            price: this.price,
            finalPrice: this.getFinalPrice(),
            durationMonths: this.durationMonths,
            limits: { ...this.limits },
        };
    }

    /**
     * Soft delete - marks plan as inactive
     */
    deactivate(): Partial<PlanProps> {
        return { isActive: false };
    }
}
