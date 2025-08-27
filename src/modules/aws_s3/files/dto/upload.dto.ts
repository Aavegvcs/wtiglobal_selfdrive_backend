import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SignedUrlQueryDto {
  @IsString()
  key!: string;

  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(3600)
  expiresIn?: number = 300;
}

export class DownloadQueryDto {
  @IsString()
  key!: string;
}

export class UploadQueryDto {
  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsIn(['private', 'public-read'])
  acl?: 'private' | 'public-read';

  @IsOptional()
  inline?: '1' | '0';
}
