import { FileCategory } from '../../domain/types';

export interface UploadFileInput {
  file: Buffer;
  filename: string;
  mimetype: string;
  category: FileCategory;
  userId: string;
}

export interface UploadFileOutput {
  url: string;
  publicId: string;
  category: FileCategory;
  uploadedAt: Date;
}

export interface DeleteFileInput {
  publicId: string;
}

export interface DeleteFileOutput {
  publicId: string;
  deletedAt: Date;
}

export interface GenerateSignatureInput {
  timestamp: number;
  category: FileCategory;
  userId: string;
}

export interface GenerateSignatureOutput {
  signature: string;
  apiKey: string;
  timestamp: number;
  folder: string;
}
