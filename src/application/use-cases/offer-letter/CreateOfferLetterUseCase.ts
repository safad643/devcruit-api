import {
    IApplicationRepository,
    IJobRepository,
    IDeveloperProfileRepository,
    ICompanyProfileRepository,
    IUserRepository,
    IOfferLetterRepository,
} from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../domain/errors';
import { ApplicationStatus, ApplicationProps } from '../../../domain/entities/Application';
import { CreateOfferLetterInput, CreateOfferLetterOutput } from '../../dtos/offerLetter.dto';
import { IEmailService } from '../../services';
import { ICreateOfferLetterUseCase } from './interfaces';
import { OfferLetter } from '../../../domain/entities/OfferLetter';

@injectable()
export class CreateOfferLetterUseCase implements ICreateOfferLetterUseCase {
    constructor(
        @inject(TYPES.ApplicationRepository) private applicationRepository: IApplicationRepository,
        @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
        @inject(TYPES.DeveloperProfileRepository) private developerProfileRepository: IDeveloperProfileRepository,
        @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository,
        @inject(TYPES.UserRepository) private userRepository: IUserRepository,
        @inject(TYPES.OfferLetterRepository) private offerLetterRepository: IOfferLetterRepository,
        @inject(TYPES.EmailService) private emailService: IEmailService
    ) { }

    async execute(input: CreateOfferLetterInput): Promise<CreateOfferLetterOutput> {
        // 1. Get application
        const application = await this.applicationRepository.findById(input.applicationId);
        if (!application) {
            throw new NotFoundError('Application not found');
        }

        // 2. Verify the application belongs to the company
        if (application.companyId !== input.companyId) {
            throw new ForbiddenError('You do not have access to this application');
        }

        // 3. Validate application status - must be interview_completed or offer_extended (for revisions)
        const allowedStatuses = ['interview_completed', 'offer_extended'];
        if (!allowedStatuses.includes(application.status)) {
            throw new ValidationError(
                `Cannot create offer letter for application with status '${application.status}'. ` +
                `Only applications with status 'interview_completed' or 'offer_extended' can receive an offer.`
            );
        }

        // 4. Get job details
        const job = await this.jobRepository.findById(application.jobId);
        if (!job) {
            throw new NotFoundError('Job not found');
        }

        // 5. Get company profile
        const companyProfile = await this.companyProfileRepository.findByUserId(input.companyId);
        if (!companyProfile) {
            throw new NotFoundError('Company profile not found');
        }

        // 6. Get developer profile and user
        const developerProfile = await this.developerProfileRepository.findById(application.developerId);
        if (!developerProfile) {
            throw new NotFoundError('Developer profile not found');
        }

        const developerUser = await this.userRepository.findById(developerProfile.userId);
        if (!developerUser) {
            throw new NotFoundError('Developer user not found');
        }

        // 7. Check if there's already an offer letter - get next version
        const existingOffer = await this.offerLetterRepository.findLatestByApplicationId(input.applicationId);
        const version = existingOffer ? existingOffer.version + 1 : 1;

        // If there's an existing pending offer, mark it as revised
        if (existingOffer && existingOffer.status === 'pending') {
            await this.offerLetterRepository.update(existingOffer.id, { status: 'revised' });
        }

        // 8. Create offer letter with auto-filled data
        const offerLetterData = OfferLetter.create({
            applicationId: input.applicationId,
            version,

            // Auto-filled from existing data
            jobTitle: job.title,
            jobDescription: job.description,
            companyName: companyProfile.companyName,
            companyAddress: companyProfile.businessAddress,
            companyLogoUrl: companyProfile.logoUrl,
            signatoryName: companyProfile.fullName,
            signatoryDesignation: input.signatoryDesignation || 'Authorized Representative',
            candidateName: developerUser.name || developerUser.email,
            candidateEmail: developerUser.email,
            workArrangement: job.workArrangement,
            location: job.location,
            jobType: job.jobType,
            benefits: job.benefits,

            // Company-provided fields
            offeredSalary: input.offeredSalary,
            salaryCurrency: input.salaryCurrency,
            salaryFrequency: input.salaryFrequency,
            proposedStartDate: new Date(input.proposedStartDate),
            offerExpirationDate: new Date(input.offerExpirationDate),
            probationPeriodMonths: input.probationPeriodMonths,
            noticePeriodDays: input.noticePeriodDays,
            reportingManager: input.reportingManager,
            documentsRequired: input.documentsRequired,
            additionalTerms: input.additionalTerms,
        });

        const createdOfferLetter = await this.offerLetterRepository.create(offerLetterData);

        // 9. Update application status to offer_extended and link offer letter
        const updateData: Partial<ApplicationProps> = {
            status: 'offer_extended' as ApplicationStatus,
            lastUpdatedAt: new Date(),
            currentOfferLetterId: createdOfferLetter.id,
        };

        await this.applicationRepository.update(input.applicationId, updateData);

        // 10. Send email notification
        try {
            // TODO: Implement proper email template for offer letter notification
            console.log(
                `Offer letter sent to ${developerUser.email} for ${job.title} at ${companyProfile.companyName}. ` +
                `Expires on ${input.offerExpirationDate}`
            );
        } catch (error) {
            console.error('Failed to send offer letter notification:', error);
        }

        return {
            id: createdOfferLetter.id,
            applicationId: createdOfferLetter.applicationId,
            version: createdOfferLetter.version,
            status: createdOfferLetter.status,
            message: 'Offer letter created successfully',
        };
    }
}
