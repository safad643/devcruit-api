export interface BlockUserInput {
  userId: string;
}

export interface BlockUserOutput {
  userId: string;
  message: string;
}

export interface UnblockUserInput {
  userId: string;
}

export interface UnblockUserOutput {
  userId: string;
  message: string;
}

export interface ApproveCompanyInput {
  companyId: string;
}

export interface ApproveCompanyOutput {
  companyId: string;
  userId: string;
  message: string;
}

export interface RejectCompanyInput {
  companyId: string;
  documents: Array<{
    documentKey: string;
    note?: string;
  }>;
}

export interface RejectCompanyOutput {
  companyId: string;
  userId: string;
  message: string;
}

