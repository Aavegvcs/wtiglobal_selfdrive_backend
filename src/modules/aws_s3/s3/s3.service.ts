import {
  Inject,
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { randomUUID } from 'crypto';
import { S3_CLIENT } from './s3.module';

console.log(S3_CLIENT)
type ACL = 'private' | 'public-read';

@Injectable()
export class S3Service {
  private readonly bucket = process.env.AWS_S3_BUCKET!;
  private readonly defaultPrefix = (process.env.AWS_S3_DEFAULT_PREFIX || '').replace(/^\/|\/$/g, '');
  private readonly defaultAcl = (process.env.AWS_S3_ACL || 'private') as ACL;
  private readonly cfDomain = process.env.CLOUDFRONT_DOMAIN || '';

  constructor(@Inject('S3_CLIENT') private readonly s3: S3Client) {}

  private sanitizeName(name: string) {
    // remove path traversal & control chars; keep basic filename chars
    return name
      .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, '')
      .replace(/[/\\]+/g, '_')
      .replace(/\s+/g, '_');
  }

  private buildKey(folder: string | undefined, originalName: string, keyOverride?: string) {
    const filename = `${Date.now()}_${randomUUID()}_${this.sanitizeName(originalName)}`;
    if(keyOverride && folder){
      return `${keyOverride}/${folder}/${filename}`;
    }else{
      return `${this.defaultPrefix}/${filename}`;
    }

    // if (keyOverride) {
    //   if (keyOverride.includes('..') || keyOverride.startsWith('/') || keyOverride.includes('\\')) {
    //     throw new BadRequestException('Invalid key');
    //   }
    //   return this.prefixJoin(keyOverride);
    // }
    // const safeFolder = folder ? folder.replace(/^\/|\/$/g, '') : this.defaultPrefix;
    // const filename = `${Date.now()}_${randomUUID()}_${this.sanitizeName(originalName)}`;
    // // return filename;
    // return this.prefixJoin(safeFolder ? `${safeFolder}/${filename}` : filename);
  }

  // private prefixJoin(key: string) {
  //   const prefix = this.defaultPrefix ? `${this.defaultPrefix}/` : '';
  //   // Avoid double prefix if user already passed full key
  //   return key.startsWith(this.defaultPrefix) ? key : `${prefix}${key}`.replace(/\/{2,}/g, '/');
  // }

  async uploadBuffer(params: {
    buffer: Buffer;
    originalName: string;
    contentType?: string;
    folder?: string;     // logical folder
    keyOverride?: string;
    acl?: ACL;
    cacheControl?: string;
    inline?: boolean;    // control ContentDisposition
  }) {
    // console.log(params);
    const { buffer, originalName, contentType, folder, keyOverride, acl, cacheControl, inline } = params;
    const Key = this.buildKey(folder, originalName, keyOverride);
    const ACL = acl ?? this.defaultAcl;


    // console.log(Key,ACL,contentType,);
    try {
      // Use multipart Upload for reliability on larger files too
      const uploader = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucket,
          Key,
          Body: buffer,
          ContentType: contentType || 'application/octet-stream',
          // ACL,
          // CacheControl: cacheControl ?? (ACL === 'public-read' ? 'public, max-age=31536000, immutable' : undefined),
          ContentDisposition: inline ? 'inline' : undefined,
        },
        queueSize: 4, // concurrency
        partSize: 5 * 1024 * 1024,
        leavePartsOnError: false,
      });
      await uploader.done();

      return {
        bucket: this.bucket,
        key: Key,
        s3Uri: `s3://${this.bucket}/${Key}`,
        publicUrl:
          ACL === 'public-read'
            ? (this.cfDomain
                ? `https://${this.cfDomain}/${Key}`
                : `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`)
            : undefined,
      };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('S3 upload failed');
    }
  }

  // async head(key: string) {
  //   const Key = this.prefixJoin(key);
  //   try {
  //     return await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key }));
  //   } catch {
  //     throw new NotFoundException('Object not found');
  //   }
  // }

  // async getObjectStream(key: string): Promise<Readable> {
  //   const Key = this.prefixJoin(key);
  //   try {
  //     const res = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key }));
  //     const body: any = res.Body;
  //     // Node 18: may be a web stream
  //     // @ts-ignore
  //     return body instanceof Readable ? body : (Readable.fromWeb?.(body) ?? body);
  //   } catch {
  //     throw new NotFoundException('Object not found');
  //   }
  // }

  // async getPresignedGetObjectUrl(key: string, expiresInSeconds = 300) {
  //   const Key = this.prefixJoin(key);
  //   const cmd = new GetObjectCommand({ Bucket: this.bucket, Key });
  //   const url = await getSignedUrl(this.s3, cmd, { expiresIn: expiresInSeconds });
  //   return { url, expiresIn: expiresInSeconds };
  // }

  // async list(prefix = '') {
  //   const Prefix = this.prefixJoin(prefix).replace(/\/$/, '');
  //   const out = await this.s3.send(new ListObjectsV2Command({ Bucket: this.bucket, Prefix }));
  //   return (out.Contents ?? []).map((c) => ({
  //     key: c.Key,
  //     size: c.Size,
  //     lastModified: c.LastModified,
  //     etag: c.ETag,
  //   }));
  // }

  // async delete(key: string) {
  //   const Key = this.prefixJoin(key);
  //   await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key }));
  //   return { deleted: true, key: Key };
  // }

  // // Optional convenience if you want CloudFront URLs for public-read
  // cfPublicUrlFor(key: string) {
  //   if (!this.cfDomain) return null;
  //   return `https://${this.cfDomain}/${this.prefixJoin(key)}`;
  // }
}
