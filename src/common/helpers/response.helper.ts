import { Logger } from '@nestjs/common';

export interface StandardResponse<T = any> {
  success: boolean;
  message: string;
  statusCode: number;
  result?: T;
  error?: any;
  apiName?: string;
}

const logger = new Logger('StandardResponse');

export function standardResponse<T = any>(
  success: boolean,
  message: string,
  statusCode: number,
  result?: T,
  error?: any,
  apiName?: string,
): StandardResponse<T> {
  const response: StandardResponse<T> = {
    success,
    message,
    statusCode,
  };
  logger.log(`API: ${apiName}, Status: ${statusCode}, Message: ${message}`);

  if (result) {
    logger.log(`Response data:✅  ${JSON.stringify(result)}`);
    response.result = result;
  }
  if (error) {
    logger.error(`Error:❌ ${error}`);
    response.error = error?.message;
  }

  return response;
}



export const tripTripMap = {
    DAILY_RENTAL: {
        code: 1,
        textValue: "Daily or Weelky"
    },
    MONTHLY_RENTAL: {
        code: 2,
        textValue: "Monthly"
    }
}
