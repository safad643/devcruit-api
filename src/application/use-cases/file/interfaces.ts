import { DeleteFileInput, DeleteFileOutput, GenerateSignatureInput, GenerateSignatureOutput } from '../../dtos/file.dto';

export interface IGenerateSignatureUseCase {
    execute(input: GenerateSignatureInput): Promise<GenerateSignatureOutput>;
}

export interface IDeleteFileUseCase {
    execute(input: DeleteFileInput): Promise<DeleteFileOutput>;
}
