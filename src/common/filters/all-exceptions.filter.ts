import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { standardResponse } from '../helpers/response.helper';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorMessage: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null && 'message' in res) {
        message = (res as any);
      } else {
        message = res as string;
      }
      errorMessage = JSON.stringify(exception as any);
    } else if (exception instanceof Error) {
      message = exception.message;
      errorMessage = JSON.stringify(exception);
    } else {
      errorMessage = JSON.stringify(exception);
    }

    const formatted = standardResponse(
      false,
      message,
      status,
      undefined,
      errorMessage,
      "Coming from - Exception Handler"
    );

    response.status(status).json(formatted);
  }
}
