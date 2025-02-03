import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import * as path from "path";
import * as crypto from "crypto";
import { Readable } from "stream";

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
    try {
      const uniqueFileName = `${crypto.randomUUID()}${path.extname(file.originalname)}`;

      const params = {
        Bucket: this.bucketName,
        Key: uniqueFileName,
        Body: Buffer.from(file.buffer),
        ContentType: file.mimetype,
      };
      if (!file.buffer || file.buffer.length === 0) {
        throw new Error("Файл пустой или отсутствует");
      }
      console.log("Попадаем в UploadFile - отправка на облако");
      await this.s3.send(new PutObjectCommand(params));
      return `https://${process.env.S3_HOST}/${this.bucketName}/${uniqueFileName}`;
    } catch (error) {
      console.error("Ошибка при загрузке файла:", error);
      throw new Error("Ошибка загрузки файла в S3");
    }
  }
}
