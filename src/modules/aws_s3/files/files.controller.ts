import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { S3Service } from '../s3/s3.service';
import { DownloadQueryDto, SignedUrlQueryDto, UploadQueryDto } from './dto/upload.dto';
import { ParseFilePipeBuilder } from '@nestjs/common';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
]);

@Controller('files')
export class FilesController {
  constructor(private readonly s3: S3Service) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME.has(file.mimetype)) {
          return cb(new BadRequestException('Unsupported file type') as any, false);
        }
        cb(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: MAX_SIZE })
        .build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @Query() q: UploadQueryDto,
  ) {
    const inline = q.inline === '1';
    return this.s3.uploadBuffer({
      buffer: file.buffer,
      originalName: file.originalname,
      contentType: file.mimetype,
      folder: q.folder,
      keyOverride: q.key,
      acl: q.acl,
      inline,
    });
  }

  // Stream back (works for private files)
//   @Get('download')
//   async download(@Query() q: DownloadQueryDto, @Res() res: Response) {
//     const head = await this.s3.head(q.key);
//     res.setHeader('Content-Type', head.ContentType ?? 'application/octet-stream');
//     const stream = await this.s3.getObjectStream(q.key);
//     return stream.pipe(res);
//   }

//   // Generate short-lived S3 link for direct browser view
//   @Get('signed-url')
//   async signed(@Query() q: SignedUrlQueryDto) {
//     return this.s3.getPresignedGetObjectUrl(q.key, q.expiresIn ?? 300);
//   }

//   // Pretty viewer link → 302 redirect to signed S3 URL
//   @Get('view')
//   async view(@Query() q: DownloadQueryDto, @Res() res: Response) {
//     const { url } = await this.s3.getPresignedGetObjectUrl(q.key, 300);
//     return res.redirect(url);
//   }

//   // Optional: stable public URL via CloudFront (only if ACL public-read and CF in front)
//   @Get('public-url')
//   publicUrl(@Query() q: DownloadQueryDto) {
//     const url = this.s3.cfPublicUrlFor(q.key);
//     if (!url) throw new BadRequestException('CloudFront domain not configured');
//     return { url };
//   }

//   @Get('list')
//   list(@Query('prefix') prefix = '') {
//     return this.s3.list(prefix);
//   }

//   // Avoid using :key path param for keys with slashes – use query
//   @Delete()
//   remove(@Query() q: DownloadQueryDto) {
//     return this.s3.delete(q.key);
//   }

//   // If you really need path style:
//   @Get(':filename')
//   async legacy(@Param('filename') filename: string, @Res() res: Response) {
//     // For flat keys only (no '/')
//     if (filename.includes('/')) {
//       throw new BadRequestException('Use /files/download?key= for nested keys');
//     }
//     const head = await this.s3.head(filename);
//     res.setHeader('Content-Type', head.ContentType ?? 'application/octet-stream');
//     const stream = await this.s3.getObjectStream(filename);
//     return stream.pipe(res);
//   }
}
