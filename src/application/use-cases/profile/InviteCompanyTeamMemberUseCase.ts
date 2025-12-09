import { inject, injectable } from 'inversify';
import { TYPES } from '../../../di/types';
import {
  CompanyTeamMember,
  ICompanyProfileRepository,
  ICompanyTeamRepository,
  IUserRepository
} from '../../../domain/repositories';
import { CompanyTeamMemberDTO, IInviteCompanyTeamMemberUseCase, InviteCompanyTeamMemberInput } from './interfaces';
import { ForbiddenError, NotFoundError, ValidationError, ConflictError } from '../../../domain/errors';
import { User } from '../../../domain/entities/User';
import { HRProfile } from '../../../domain/entities/HRProfile';
import { IHashService, IEmailService, ICryptographicService } from '../../services';

@injectable()
export class InviteCompanyTeamMemberUseCase implements IInviteCompanyTeamMemberUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.CompanyTeamRepository) private companyTeamRepository: ICompanyTeamRepository,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.HashService) private hashService: IHashService,
    @inject(TYPES.EmailService) private emailService: IEmailService,
    @inject(TYPES.CryptographicService) private cryptographicService: ICryptographicService
  ) { }

  async execute(input: InviteCompanyTeamMemberInput): Promise<CompanyTeamMemberDTO> {
    const inviter = await this.userRepository.findById(input.inviterUserId);
    if (!inviter) {
      throw new NotFoundError('Inviting user not found');
    }
    if (inviter.role !== 'company') {
      throw new ForbiddenError('Only company owners can invite team members');
    }

    const companyProfile = await this.companyProfileRepository.findByUserId(inviter.id);
    if (!companyProfile) {
      throw new NotFoundError('Company profile not found');
    }

    if (input.role !== 'hr' && input.role !== 'interviewer') {
      throw new ValidationError('Only HR or Interviewer roles can be invited');
    }

    const normalizedEmail = input.email.trim().toLowerCase();

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError('An account already exists with this email address');
    }

    const existingInvite = await this.companyTeamRepository.findByEmail(companyProfile.userId, normalizedEmail);
    if (existingInvite) {
      throw new ConflictError('This email has already been invited to your team');
    }

    const tempPassword = this.cryptographicService.generateTemporaryPassword();
    const hashedPassword = await this.hashService.hash(tempPassword);

    const userProps = User.create({
      email: normalizedEmail,
      name: input.fullName || normalizedEmail.split('@')[0], // Use fullName if provided, otherwise fallback to email prefix
      password: hashedPassword,
      role: input.role,
      authProviders: ['local'],
    });
    const user = await this.userRepository.create(userProps);
    await this.userRepository.update(user.id, user.withProfileCompleted(true));

    const teamMember = await this.companyTeamRepository.inviteMember({
      companyId: companyProfile.userId,
      email: normalizedEmail,
      role: input.role,
      fullName: input.fullName,
      jobTitle: input.jobTitle,
      invitedBy: inviter.id,
      userId: user.id,
    });

    await this.emailService.sendTeamInvite(
      normalizedEmail,
      tempPassword,
      companyProfile.companyName,
      input.role
    );

    return this.toDTO(teamMember, input.role);
  }

  private toDTO(member: CompanyTeamMember, role: 'hr' | 'interviewer'): CompanyTeamMemberDTO {
    return {
      id: member.id,
      email: member.email,
      fullName: member.fullName,
      role: role,
      status: member.status,
      invitedAt: member.invitedAt,
      activatedAt: member.activatedAt,
    };
  }
}

