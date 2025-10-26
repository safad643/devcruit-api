import { injectable } from 'inversify';
import { v2 as cloudinary } from 'cloudinary';
import { IFileService } from '../../application/services';
import { FileCategory } from '../../domain/types';
import { ValidationError } from '../../domain/errors';
import { config } from '../../config';

@injectable()
export class CloudinaryService implements IFileService {
  constructor() {
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
    });
  }

  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    mimetype: string,
    category: FileCategory,
    userId: string
  ): Promise<{ url: string; publicId: string }> {
    // Validate file type based on category
    this.validateFileType(mimetype, category);

    // Map category to Cloudinary folder with userId
    const folder = this.getFolderForCategory(category, userId);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto', // auto-detect file type (image, video, raw)
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            reject(new ValidationError(`Failed to upload file: ${error.message}`));
            return;
          }

          if (!result) {
            reject(new ValidationError('Upload failed: No result returned'));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(new ValidationError(`Failed to delete file: ${error.message}`));
          return;
        }

        if (result?.result === 'not found') {
          reject(new ValidationError('File not found'));
          return;
        }

        resolve();
      });
    });
  }

  private validateFileType(mimetype: string, category: FileCategory): void {
    const allowedTypes: Record<FileCategory, string[]> = {
      PROFILE_PICTURE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      DEGREE_CERTIFICATE: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
      CV: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    };

    const allowed = allowedTypes[category];
    if (!allowed.includes(mimetype)) {
      throw new ValidationError(
        `Invalid file type for ${category}. Allowed types: ${allowed.join(', ')}`
      );
    }
  }

  private getFolderForCategory(category: FileCategory, userId: string): string {
    return `devcruit/${userId}/${category.toLowerCase()}`;
  }
}
