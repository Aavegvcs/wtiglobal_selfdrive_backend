import { Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { S3Service } from './s3.service';

export const S3_CLIENT = 'S3_CLIENT';

@Module({
  providers: [
    {
      provide: S3_CLIENT,
      useFactory: () =>
        new S3Client({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
          },
          // Optional: tune Node HTTP handler agents if you like
        }),
    },
    S3Service,
  ],
  exports: [S3Service],
})
export class S3Module {}
