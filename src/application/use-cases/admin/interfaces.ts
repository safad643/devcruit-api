import {
    ApproveCompanyInput,
    ApproveCompanyOutput,
    BlockUserInput,
    BlockUserOutput,
    ListCompaniesInput,
    ListCompaniesOutput,
    ListDevelopersInput,
    ListDevelopersOutput,
    RejectCompanyInput,
    RejectCompanyOutput,
    UnblockUserInput,
    UnblockUserOutput,
    GetCompanyDetailsOutput,
} from '../../dtos/admin.dto';

export interface IBlockUserUseCase {
    execute(input: BlockUserInput): Promise<BlockUserOutput>;
}

export interface IUnblockUserUseCase {
    execute(input: UnblockUserInput): Promise<UnblockUserOutput>;
}

export interface IApproveCompanyUseCase {
    execute(input: ApproveCompanyInput): Promise<ApproveCompanyOutput>;
}

export interface IRejectCompanyUseCase {
    execute(input: RejectCompanyInput): Promise<RejectCompanyOutput>;
}

export interface IListCompaniesUseCase {
    execute(input: ListCompaniesInput): Promise<ListCompaniesOutput>;
}

export interface IListDevelopersUseCase {
    execute(input: ListDevelopersInput): Promise<ListDevelopersOutput>;
}

export interface IGetCompanyDetailsUseCase {
    execute(companyId: string): Promise<GetCompanyDetailsOutput>;
}
