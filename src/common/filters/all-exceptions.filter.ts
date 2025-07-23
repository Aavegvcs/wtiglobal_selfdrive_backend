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
        message = (res as any).message;
      } else {
        message = res as string;
      }
      errorMessage = (exception as any)?.message;
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
      message = exception.message;
    } else {
      errorMessage = String(exception);
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
