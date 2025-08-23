import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../middlewares/fileUploader";

// Initialize S3 client
/*
const s3Client = new S3Client({
  region: config.digitaloceanS3.region as string,
  endpoint: 'https://nyc3.digitaloceanspaces.com',
  credentials: {
    accessKeyId: config.digitaloceanS3.accessKeyId as string,
    secretAccessKey: config.digitaloceanS3.secretAccessKey as string,
  },
});
*/

/**
 * Delete file from S3 by its public URL
 * @param {string} fileUrl - The full URL of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFromS3ByUrl = async (fileUrl: string): Promise<void> => {
  const bucketName = process.env.SPACE_BUCKET;

  if (!bucketName) {
    throw new Error("S3 bucket name is not defined in the configuration.");
  }

  // Extract the key from the URL
  try {
    const url = new URL(fileUrl);
    // console.log(32, fileUrl);
    const key = url.pathname.slice(1); // Remove the leading "/"
    // console.log("Extracted Key:", key);

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error: any) {
    throw new Error(`Failed to delete file from S3: ${fileUrl}`);
  }
};
