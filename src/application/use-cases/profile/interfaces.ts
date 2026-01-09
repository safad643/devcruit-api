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
    CompanyTeamMemberDTO,
    InviteCompanyTeamMemberInput,
    ListCompanyTeamMembersInput,
    PaginatedTeamMembersResponse,
    UpdateCompanyTeamMemberInput,
    DeleteCompanyTeamMemberInput,
} from '../../dtos/profile.dto';

// Re-export DTOs for convenience
export {
    CompanyTeamMemberDTO,
    InviteCompanyTeamMemberInput,
    ListCompanyTeamMembersInput,
    PaginatedTeamMembersResponse,
    UpdateCompanyTeamMemberInput,
    DeleteCompanyTeamMemberInput,
};

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

export interface IInviteCompanyTeamMemberUseCase {
    execute(input: InviteCompanyTeamMemberInput): Promise<CompanyTeamMemberDTO>;
}

export interface IListCompanyTeamMembersUseCase {
    execute(input: ListCompanyTeamMembersInput): Promise<PaginatedTeamMembersResponse>;
}

export interface IUpdateCompanyTeamMemberUseCase {
    execute(input: UpdateCompanyTeamMemberInput): Promise<CompanyTeamMemberDTO>;
}

export interface IDeleteCompanyTeamMemberUseCase {
    execute(input: DeleteCompanyTeamMemberInput): Promise<void>;
}
