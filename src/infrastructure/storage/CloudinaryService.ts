import { injectable } from 'inversify';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import { IFileService, GenerateSignatureParams, SignatureResult } from '../../application/services';
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

  async generateSignature(params: GenerateSignatureParams): Promise<SignatureResult> {
    const { timestamp, category, userId } = params;

    // Get or create folder
    const folder = params.folder || this._getFolderForCategory(category, userId);

    // Create parameters to sign (according to Cloudinary signed upload docs)
    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder,
    };

    // Create signature string: "key=value&key=value"
    const signatureString = Object.keys(paramsToSign)
      .sort()
      .map(key => `${key}=${paramsToSign[key]}`)
      .join('&');

    // Generate signature using API secret
    const signature = crypto
      .createHash('sha1')
      .update(signatureString + config.cloudinary.apiSecret)
      .digest('hex');

    return {
      signature,
      apiKey: config.cloudinary.apiKey,
      timestamp,
      folder,
    };
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

  private _getFolderForCategory(category: FileCategory, userId: string): string {
    return `devcruit/${userId}/${category.toLowerCase()}`;
  }
}
