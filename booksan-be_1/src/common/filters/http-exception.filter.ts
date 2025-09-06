import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  error: string;
  message: string;
  path: string;
  timestamp: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload: ErrorResponse = {
      error:
        exception instanceof HttpException
          ? exception.name
          : 'InternalServerError',
      message:
        exception instanceof HttpException
          ? ((exception.getResponse() as { message: string })?.message ??
            exception.message)
          : 'Unexpected error',
      path: req.url,
      timestamp: new Date().toISOString(),
    };
    res.status(status).json(payload);
  }
}
