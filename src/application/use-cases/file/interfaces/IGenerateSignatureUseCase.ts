import { GenerateSignatureInput, GenerateSignatureOutput } from '../GenerateSignatureUseCase';

export interface IGenerateSignatureUseCase {
  execute(input: GenerateSignatureInput): Promise<GenerateSignatureOutput>;
}

