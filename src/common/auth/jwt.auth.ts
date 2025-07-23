// jwt.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export interface TokenPayload {
  user_obj_id: string;
  emailID: string;
  username: string;
  profileImg: string;
  role: string;
  countryName: string;
}

const logger = new Logger('jwtAuth');

export const generateAccessToken = async (payload: TokenPayload, configService: ConfigService): Promise<string> => {

  const token = jwt.sign(payload, configService.get<string>('JWT_ACCESS_SECRET'), { expiresIn: '1d' });
  logger.log('Access Token:', token);
  return token;
};

export const generateRefreshToken = async (payload: TokenPayload, configService: ConfigService): Promise<string> => {

  const token = jwt.sign(payload, configService.get<string>('JWT_REFRESH_SECRET'), { expiresIn: '30d' });
  logger.log('Refresh Token:', token);
  return token;
};

