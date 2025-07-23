import { Logger } from '@nestjs/common';
import { timeStamp } from '../utils/time.util';

export interface StandardResponse<T = any> {
  success: boolean;
  message: string;
  statusCode: number;
  data?: T;
  error?: any;
  apiName?: string;
}

const logger = new Logger('StandardResponse');

export function standardResponse<T = any>(
  success: boolean,
  message: string,
  statusCode: number,
  data?: T,
  error?: any,
  apiName?: string,
): StandardResponse<T> {
  const response: StandardResponse<T> = {
    success,
    message,
    statusCode,
  };
  logger.log(`API: ${apiName}, Status: ${statusCode}, Message: ${message}`);

  if (data) {
    logger.log(`Response data:✅  ${JSON.stringify(data)}`);
    response.data = data;
  }
  if (error) {
    logger.error(`Error:❌ ${error}`);
    response.error = error?.message;
  }

  return response;
}
