import {
    CreateCompanyProfileInput,
    CreateCompanyProfileOutput,
    CreateDeveloperProfileInput,
    CreateDeveloperProfileOutput,
    GetCompanyProfileOutput,
    GetDeveloperProfileOutput,
    ResubmitDocumentsInput,
    ResubmitDocumentsOutput,
    UpdateCompanyProfileInput,
    UpdateCompanyProfileOutput,
    UpdateDeveloperProfileInput,
    UpdateDeveloperProfileOutput,
} from '../../dtos/profile.dto';
import { CompanyTeamMemberStatus } from '../../../domain/types';

export interface ICreateDeveloperProfileUseCase {
    execute(input: CreateDeveloperProfileInput): Promise<CreateDeveloperProfileOutput>;
}

export interface IGetDeveloperProfileUseCase {
    execute(userId: string): Promise<GetDeveloperProfileOutput>;
}

export interface IUpdateDeveloperProfileUseCase {
    execute(userId: string, input: UpdateDeveloperProfileInput): Promise<UpdateDeveloperProfileOutput>;
}

export interface ICreateCompanyProfileUseCase {
    execute(input: CreateCompanyProfileInput): Promise<CreateCompanyProfileOutput>;
}

export interface IGetCompanyProfileUseCase {
    execute(userId: string): Promise<GetCompanyProfileOutput>;
}

export interface IUpdateCompanyProfileUseCase {
    execute(userId: string, input: UpdateCompanyProfileInput): Promise<UpdateCompanyProfileOutput>;
}

export interface IResubmitDocumentsUseCase {
    execute(input: ResubmitDocumentsInput): Promise<ResubmitDocumentsOutput>;
}

export interface CompanyTeamMemberDTO {
    id: string;
    userId?: string | null;
    email: string;
    fullName?: string;
    role: 'hr' | 'interviewer';
    status: CompanyTeamMemberStatus;
    invitedAt: Date;
    activatedAt?: Date;
}

export interface InviteCompanyTeamMemberInput {
    inviterUserId: string;
    email: string;
    role: 'hr' | 'interviewer';
    fullName?: string;
    jobTitle?: string;
}

export interface IInviteCompanyTeamMemberUseCase {
    execute(input: InviteCompanyTeamMemberInput): Promise<CompanyTeamMemberDTO>;
}

export interface IListCompanyTeamMembersUseCase {
    execute(companyUserId: string): Promise<CompanyTeamMemberDTO[]>;
}
