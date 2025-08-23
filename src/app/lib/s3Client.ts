import { S3Client } from "@aws-sdk/client-s3";
import config from "../../config";

// Configure DigitalOcean Spaces (S3-compatible)

export const s3Client = new S3Client({
  region: config.S3.space_origin_endpoint,
  endpoint: config.S3.space_origin_endpoint,
  credentials: {
    accessKeyId: config.S3.space_accesskey as string,
    secretAccessKey: config.S3.space_secret_key as string,
  },
});


// export const s3Client2 = new S3Client({
//   region: config.S3.region,
//   endpoint: config.S3.region,
//   credentials: {
//     accessKeyId: process.env.DO_SPACE_ACCESS_KEY || "",
//     secretAccessKey: process.env.DO_SPACE_SECRET_KEY || "",
//   },
// });


