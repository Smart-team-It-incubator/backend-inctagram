import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import * as path from "path";
import * as crypto from "crypto";

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucketName: string;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
      endpoint: `https://${process.env.S3_HOST}`
    });
    this.bucketName = process.env.S3_BUCKET_NAME
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const uniqueFileName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;

    const params = {
      Bucket: this.bucketName,
      Key: uniqueFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await this.s3.send(new PutObjectCommand(params));
    return `https://${process.env.S3_HOST}/${this.bucketName}/${uniqueFileName}`;
  }
}
