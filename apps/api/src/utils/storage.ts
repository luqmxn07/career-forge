import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { ExternalServiceError } from "../errors/index.js";
import { logger } from "./logger.js";
import { Readable } from "stream";
import crypto from "crypto";

const isCloudinaryConfigured = !!(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
  });
  logger.info("☁️ Cloudinary SDK configured successfully");
} else {
  logger.warn("⚠️ Cloudinary credentials missing. File uploads will run in MOCK mode.");
}

export interface UploadResult {
  secureUrl: string;
  publicId: string;
}

/**
 * Uploads a file buffer to Cloudinary.
 * @param buffer The file buffer (e.g. from multer)
 * @param folder The target directory name in Cloudinary
 * @param options Additional Cloudinary upload parameters
 */
export const uploadBuffer = async (
  buffer: Buffer,
  folder: string,
  options: Record<string, any> = {}
): Promise<UploadResult> => {
  if (!isCloudinaryConfigured) {
    // Return mock upload result in local development if credentials are empty
    const mockId = `${folder}_mock_${crypto.randomUUID()}`;
    logger.debug(`Mocking Cloudinary upload to folder "${folder}": ${mockId}`);
    return {
      secureUrl: `https://res.cloudinary.com/mock-cloud/image/upload/v1/${folder}/${mockId}.png`,
      publicId: `${folder}/${mockId}`
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `careerforge/${folder}`,
        ...options
      },
      (error, result) => {
        if (error) {
          logger.error("Cloudinary upload failed:", error);
          return reject(
            new ExternalServiceError("Failed to upload file to Cloudinary storage", error)
          );
        }
        if (!result) {
          return reject(new ExternalServiceError("Cloudinary upload returned empty result"));
        }
        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

/**
 * Uploads a profile picture with automatic cropping and resizing constraints.
 * @param buffer The picture buffer
 */
export const uploadProfilePicture = async (buffer: Buffer): Promise<UploadResult> => {
  return uploadBuffer(buffer, "avatars", {
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" }
    ]
  });
};

/**
 * Deletes a file from Cloudinary by its public ID.
 * @param publicId The target Cloudinary public ID
 */
export const deleteFile = async (publicId: string): Promise<void> => {
  if (!isCloudinaryConfigured) {
    logger.debug(`Mocking Cloudinary deletion for ID: ${publicId}`);
    return;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== "ok") {
      logger.warn(`Cloudinary delete returned warning: ${result.result} for ID: ${publicId}`);
    }
  } catch (error) {
    logger.error("Failed to delete file from Cloudinary:", error);
    throw new ExternalServiceError("Failed to remove file from Cloudinary storage", error);
  }
};
