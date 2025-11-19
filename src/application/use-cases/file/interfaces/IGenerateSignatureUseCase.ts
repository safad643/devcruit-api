import { GenerateSignatureInput, GenerateSignatureOutput } from '../../../dtos/file.dto';

export interface IGenerateSignatureUseCase {
  execute(input: GenerateSignatureInput): Promise<GenerateSignatureOutput>;
}

