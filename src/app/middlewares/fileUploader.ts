// import multer from "multer";
// import path from "path";
// import fs from "fs/promises";
// import crypto from "crypto";
// import { Readable } from "stream";
// import {
//   S3Client,
//   CreateMultipartUploadCommand,
//   UploadPartCommand,
//   CompleteMultipartUploadCommand,
//   AbortMultipartUploadCommand,
//   ObjectCannedACL,
// } from "@aws-sdk/client-s3";
// import config from "../../config";

// const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

// // Multer storage configuration
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(process.cwd(), "uploads"));
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = `${Date.now()}-${crypto
//       .randomBytes(6)
//       .toString("hex")}`;
//     const ext = path.extname(file.originalname);
//     const baseName = path.basename(file.originalname, ext);
//     cb(null, `${baseName}-${uniqueSuffix}${ext}`);
//   },
// });
// const upload = multer({ storage });

// const uploadProfileImage = upload.single("profileImage");
// const uploadSignatureImage = upload.single("signature");

// const uploadMultipleImage = upload.fields([
//   { name: "profileImage", maxCount: 1 },
//   { name: "coverImage", maxCount: 1 },
// ]);

// const uploadPickImage = upload.single("pickImage");

// const uploadProductImage = upload.single("productImage");

// const uploadFile = upload.single("file");
// const uploadCategoryIcon = upload.single("icon");

// const uploadServiceImage = upload.array("serviceImage", 5);

// // Configure DigitalOcean Spaces (S3-compatible)
// export const s3Client = new S3Client({
//   region: config.S3.space_bucket,
//   endpoint: config.S3.space_endpoint,
//   credentials: {
//     accessKeyId: config.S3.space_accesskey || "",
//     secretAccessKey: config.S3.space_secret_key || "",
//   },
// });

// // Function to remove a file from local storage
// const removeFile = async (filePath: string) => {
//   try {
//     await fs.unlink(filePath);
//   } catch (error) {
//     console.error(`Failed to delete file: ${filePath}`, error);
//   }
// };

// // **Multipart Upload to DigitalOcean Spaces**
// const uploadToDigitalOcean = async (
//   file: Express.Multer.File
// ): Promise<{ Location: string; Bucket: string; Key: string }> => {
//   if (!file) {
//     throw new Error("File is required for uploading.");
//   }

//   const Bucket = config.S3.space_bucket || "";
//   const Key = `test/${Date.now()}_${file.originalname}`;

//   try {
//     const fileBuffer = await fs.readFile(file.path);
//     const fileSize = fileBuffer.length;
//     const numParts = Math.ceil(fileSize / CHUNK_SIZE);

//     // Step 1: Initiate Multipart Upload
//     const createMultipartUpload = new CreateMultipartUploadCommand({
//       Bucket,
//       Key,
//       ContentType: file.mimetype,
//       ACL: "public-read" as ObjectCannedACL,
//     });
//     const { UploadId } = await s3Client.send(createMultipartUpload);

//     if (!UploadId) {
//       throw new Error("Failed to initiate multipart upload.");
//     }

//     // Step 2: Upload Parts
//     const uploadPromises = [];
//     for (let partNumber = 1; partNumber <= numParts; partNumber++) {
//       const start = (partNumber - 1) * CHUNK_SIZE;
//       const end = Math.min(start + CHUNK_SIZE, fileSize);
//       const chunk = fileBuffer.slice(start, end);

//       uploadPromises.push(
//         (async () => {
//           const uploadPart = new UploadPartCommand({
//             Bucket,
//             Key,
//             UploadId,
//             PartNumber: partNumber,
//             Body: Readable.from(chunk),
//             ContentLength: chunk.length, // ✅ Fix: Ensure ContentLength is set
//           });
//           const { ETag } = await s3Client.send(uploadPart);
//           return { PartNumber: partNumber, ETag };
//         })()
//       );
//     }

//     const uploadedParts = await Promise.all(uploadPromises);

//     // Step 3: Complete Multipart Upload
//     const completeMultipartUpload = new CompleteMultipartUploadCommand({
//       Bucket,
//       Key,
//       UploadId,
//       MultipartUpload: {
//         Parts: uploadedParts,
//       },
//     });

//     await s3Client.send(completeMultipartUpload);

//     // Remove local file after successful upload
//     await removeFile(file.path);

//     return {
//       Location: `${config.S3.space_origin_endpoint}/${Key}`,
//       Bucket,
//       Key,
//     };
//   } catch (error) {
//     console.error("Error in multipart upload:", error);

//     throw error;
//   }
// };

// // **Abort Multipart Upload (Optional)**
// const abortMultipartUpload = async (
//   Bucket: string,
//   Key: string,
//   UploadId: string
// ) => {
//   try {
//     const abortCommand = new AbortMultipartUploadCommand({
//       Bucket,
//       Key,
//       UploadId,
//     });
//     await s3Client.send(abortCommand);
//   } catch (error) {
//     console.error("Error aborting multipart upload:", error);
//   }
// };

// // Export file uploader methods
// export const fileUploader = {
//   upload,
//   abortMultipartUpload,
//   uploadToDigitalOcean,
//   uploadProfileImage,
//   uploadMultipleImage,
//   uploadPickImage,
//   uploadServiceImage,
//   uploadSignatureImage,
//   uploadFile,
//   uploadProductImage,
//   uploadCategoryIcon,
// };

import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";
import config from "../../config";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

// ----------------- Multer storage config -----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${crypto
      .randomBytes(6)
      .toString("hex")}`;
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});
const upload = multer({ storage });

// Single / multi upload configs
const uploadProfileImage = upload.single("profileImage");
const uploadSignatureImage = upload.single("signature");
const uploadMultipleImage = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]);

const uplodadCourseFile = upload.fields([
  { name: "videoUrl", maxCount: 100 },
  { name: "coverImage", maxCount: 1 },
]);
const uploadPickImage = upload.single("pickImage");
const uploadProductImage = upload.single("productImage");
const uploadFile = upload.single("file");
const uploadCategoryIcon = upload.single("icon");
const uploadServiceImage = upload.array("serviceImage", 5);

// ----------------- S3 Client -----------------
export const s3Client = new S3Client({
  region: config.S3.space_bucket, // ✅ FIX: use region not bucket
  endpoint: config.S3.space_endpoint,
  credentials: {
    accessKeyId: config.S3.space_accesskey || "",
    secretAccessKey: config.S3.space_secret_key || "",
  },
});

// ----------------- Multipart Upload -----------------
const uploadToDigitalOcean = async (
  file: Express.Multer.File
): Promise<{ Location: string; Bucket: string; Key: string }> => {
  if (!file) throw new Error("File is required for uploading.");

  const Bucket = config.S3.space_bucket || "";
  const Key = `uploads/${Date.now()}_${file.originalname}`;

  // Step 1: Initiate multipart upload
  const { UploadId } = await s3Client.send(
    new CreateMultipartUploadCommand({
      Bucket,
      Key,
      ContentType: file.mimetype,
      ACL: "public-read" as ObjectCannedACL,
    })
  );

  if (!UploadId) throw new Error("Failed to initiate multipart upload");

  try {
    const fileStream = fs.createReadStream(file.path, {
      highWaterMark: CHUNK_SIZE,
    });
    let partNumber = 1;
    const uploadedParts: { PartNumber: number; ETag?: string }[] = [];

    for await (const chunk of fileStream) {
      const { ETag } = await s3Client.send(
        new UploadPartCommand({
          Bucket,
          Key,
          UploadId,
          PartNumber: partNumber,
          Body: chunk,
          ContentLength: chunk.length,
        })
      );
      uploadedParts.push({ PartNumber: partNumber, ETag });
      partNumber++;
    }

    await s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket,
        Key,
        UploadId,
        MultipartUpload: { Parts: uploadedParts },
      })
    );

    await fs.promises.unlink(file.path);

    return {
      Location: `${config.S3.space_origin_endpoint}/${Key}`,
      Bucket,
      Key,
    };
  } catch (error) {
    console.error("Error in multipart upload:", error);
    // Rollback on failure
    await s3Client.send(
      new AbortMultipartUploadCommand({ Bucket, Key, UploadId })
    );
    throw error;
  }
};

// ----------------- Exports -----------------
export const fileUploader = {
  upload,
  uploadToDigitalOcean,
  uploadProfileImage,
  uploadMultipleImage,
  uploadPickImage,
  uploadServiceImage,
  uploadSignatureImage,
  uploadFile,
  uplodadCourseFile,
  uploadProductImage,
  uploadCategoryIcon,
};
