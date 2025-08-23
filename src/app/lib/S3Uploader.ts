import fs from "fs/promises";
import {
  AbortMultipartUploadCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import config from "../../config";
import { s3Client } from "./s3Client";


// Function to remove a file from local storage
const removeFile = async (filePath: string) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Failed to delete file: ${filePath}`, error);
  }
};

// **Multipart Upload to DigitalOcean Spaces**
const uploadToS3 = async (
  file: Express.Multer.File,
  folder?: string
): Promise<{ Location: string; Bucket: string; Key: string }> => {
  if (!file) {
    throw new Error("File is required for uploading.");
  }
  if (!file.path || !file.mimetype || !file.originalname) {
    throw new Error("Invalid file data provided.");
  }
  const Bucket = config.S3.space_bucket || "";
  const Key = folder
    ? `eshofer/${folder}/${file.originalname}`
    : `eshofer/${file.originalname}`;

  try {
    const fileBuffer = await fs.readFile(file.path);
    const command = new PutObjectCommand({
      Bucket: config.S3.space_bucket,
      Key,
      Body: fileBuffer,
      ACL: "public-read",
      ContentType: file.mimetype,
    });

    const uploadResult = await s3Client.send(command);
    console.log("Upload successful:", uploadResult);
    // const { UploadId } = await s3Client.send(createMultipartUpload);

    if (!uploadResult) {
      throw new Error("Failed to initiate multipart upload.");
    }

    // Remove local file after successful upload
    await removeFile(file.path);
    console.log(
      65,
      `https://${Bucket}.${config.S3.space_bucket_region}.digitaloceanspaces.com/${Key}`
    );

    return {
      Location: `https://${Bucket}.${config.S3.space_bucket_region}.digitaloceanspaces.com/${Key}`,
      Bucket,
      Key,
    };
  } catch (error) {
    console.error("Error in multipart upload:", error);

    throw error;
  }
};

// **Abort Multipart Upload (Optional)**
const abortMultipartUpload = async (
  Bucket: string,
  Key: string,
  UploadId: string
) => {
  try {
    const abortCommand = new AbortMultipartUploadCommand({
      Bucket,
      Key,
      UploadId,
    });
    await s3Client.send(abortCommand);
  } catch (error) {
    console.error("Error aborting multipart upload:", error);
  }
};

// Export file uploader methods
export const S3Uploader = {
  abortMultipartUpload,
  uploadToS3,
};
