import { ValidationError } from '../../domain/errors';

export interface WorkHistoryEntry {
    startDate: string;
    endDate: string | null;
    companyName?: string; // for error messages
}

/**
 * Validates date-related business rules for work history entries
 */
export class DateValidator {
    /**
     * Validates work history dates according to business rules:
     * - Start/end dates must not be in the future
     * - Start/end dates must not be more than 50 years ago
     * - End date must be after or equal to start date
     * 
     * @throws ValidationError if any date validation fails
     */
    static validateWorkHistoryDates(workHistory: WorkHistoryEntry[]): void {
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today

        const fiftyYearsAgo = new Date();
        fiftyYearsAgo.setFullYear(today.getFullYear() - 50);
        fiftyYearsAgo.setHours(0, 0, 0, 0);

        workHistory.forEach((entry, index) => {
            const identifier = entry.companyName || `entry #${index + 1}`;

            // Validate start date
            const startDate = new Date(entry.startDate);
            if (startDate > today) {
                throw new ValidationError(
                    `Work history ${identifier}: Start date cannot be in the future`
                );
            }
            if (startDate < fiftyYearsAgo) {
                throw new ValidationError(
                    `Work history ${identifier}: Start date cannot be more than 50 years ago`
                );
            }

            // Validate end date (if provided)
            if (entry.endDate) {
                const endDate = new Date(entry.endDate);

                if (endDate > today) {
                    throw new ValidationError(
                        `Work history ${identifier}: End date cannot be in the future`
                    );
                }
                if (endDate < fiftyYearsAgo) {
                    throw new ValidationError(
                        `Work history ${identifier}: End date cannot be more than 50 years ago`
                    );
                }
                if (endDate < startDate) {
                    throw new ValidationError(
                        `Work history ${identifier}: End date must be after start date`
                    );
                }
            }
        });
    }
}
