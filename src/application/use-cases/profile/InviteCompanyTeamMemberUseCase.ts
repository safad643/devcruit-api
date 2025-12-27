import { inject, injectable } from 'inversify';
import { TYPES } from '../../../di/types';
import {
  CompanyTeamMember,
  ICompanyProfileRepository,
  ICompanyTeamRepository,
  IUserRepository
} from '../../../domain/repositories';
import { CompanyTeamMemberDTO, IInviteCompanyTeamMemberUseCase, InviteCompanyTeamMemberInput } from './interfaces';
import { ForbiddenError, NotFoundError, ValidationError, ConflictError, PlanLimitError } from '../../../domain/errors';
import { User } from '../../../domain/entities/User';
import { IHashService, IEmailService, ICryptographicService } from '../../services';

@injectable()
export class InviteCompanyTeamMemberUseCase implements IInviteCompanyTeamMemberUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.CompanyTeamRepository) private _companyTeamRepository: ICompanyTeamRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.HashService) private _hashService: IHashService,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.CryptographicService) private _cryptographicService: ICryptographicService
  ) { }

  async execute(input: InviteCompanyTeamMemberInput): Promise<CompanyTeamMemberDTO> {
    const inviter = await this._userRepository.findById(input.inviterUserId);
    if (!inviter) {
      throw new NotFoundError('Inviting user not found');
    }
    if (inviter.role !== 'company') {
      throw new ForbiddenError('Only company owners can invite team members');
    }

    const companyProfile = await this._companyProfileRepository.findByUserId(inviter.id);
    if (!companyProfile) {
      throw new NotFoundError('Company profile not found');
    }

    if (input.role !== 'hr' && input.role !== 'interviewer') {
      throw new ValidationError('Only HR or Interviewer roles can be invited');
    }

    const normalizedEmail = input.email.trim().toLowerCase();

    const existingUser = await this._userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError('An account already exists with this email address');
    }

    const existingInvite = await this._companyTeamRepository.findByEmail(companyProfile.userId, normalizedEmail);
    if (existingInvite) {
      throw new ConflictError('This email has already been invited to your team');
    }

    // Check plan limits for team members
    const currentPlan = companyProfile.getCurrentPlan();
    if (currentPlan && currentPlan.limits.maxTeamMembers !== null) {
      const teamMemberCount = await this._companyTeamRepository.countActiveByCompany(companyProfile.userId);
      if (teamMemberCount >= currentPlan.limits.maxTeamMembers) {
        throw new PlanLimitError('team members', currentPlan.limits.maxTeamMembers);
      }
    }

    const tempPassword = this._cryptographicService.generateTemporaryPassword();
    const hashedPassword = await this._hashService.hash(tempPassword);

    const userProps = User.create({
      email: normalizedEmail,
      name: input.fullName || normalizedEmail.split('@')[0], // Use fullName if provided, otherwise fallback to email prefix
      password: hashedPassword,
      role: input.role,
      authProviders: ['local'],
    });
    const user = await this._userRepository.create(userProps);
    await this._userRepository.update(user.id, user.withProfileCompleted(true));

    const teamMember = await this._companyTeamRepository.inviteMember({
      companyId: companyProfile.userId,
      email: normalizedEmail,
      role: input.role,
      fullName: input.fullName,
      jobTitle: input.jobTitle,
      invitedBy: inviter.id,
      userId: user.id,
    });

    await this._emailService.sendTeamInvite(
      normalizedEmail,
      tempPassword,
      companyProfile.companyName,
      input.role
    );

    return this._toDTO(teamMember, input.role);
  }

  private _toDTO(member: CompanyTeamMember, role: 'hr' | 'interviewer'): CompanyTeamMemberDTO {
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

