import { FileCategory } from '../../domain/types';

export interface IFileService {
  uploadFile(
    fileBuffer: Buffer,
    filename: string,
    mimetype: string,
    category: FileCategory,
    userId: string
  ): Promise<{ url: string; publicId: string }>;
  
  deleteFile(publicId: string): Promise<void>;
}
