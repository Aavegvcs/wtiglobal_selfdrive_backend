import { timeStamp } from '../utils/time.util';

export interface StandardResponse<T = any> {
  success: boolean;
  message: string;
  statusCode: number;
  data?: T;
  error?: any;
}

export function standardResponse<T = any>(
  success: boolean,
  message: string,
  statusCode: number,
  data?: T,
  error?: any,
): StandardResponse<T> {
  const response: StandardResponse<T> = {
    success,
    message,
    statusCode,
  };
  console.log(
    `Time UTC:⏳ ${timeStamp()}, Status: ${statusCode}, Message: ${message}`,
);

  if (data) {
    console.log(`Response data:✅ ${JSON.stringify(data)}`);
    response.data = data;
  }
  if (error) {
    console.log(`Error:❌ ${error}`);
    response.error = error?.message;
  }

  return response;
}
