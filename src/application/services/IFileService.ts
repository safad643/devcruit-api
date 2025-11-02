import { FileCategory } from '../../domain/types';

export interface GenerateSignatureParams {
  timestamp: number;
  category: FileCategory;
  userId: string;
  folder?: string;
}

export interface SignatureResult {
  signature: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  uploadPreset?: string;
}

export interface IFileService {
  generateSignature(params: GenerateSignatureParams): Promise<SignatureResult>;
  
  deleteFile(publicId: string): Promise<void>;
}
