import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Determine the status code and error response object
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 
        exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Handle class-validator errors, which return a complex object
    if (typeof message === 'object' && 'message' in message) {
        // message.message is usually an array of validation errors
        message = (message as { message: string | string[] }).message;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: Array.isArray(message) ? message.join(', ') : String(message),
    };

    // Log the error (optional, but highly recommended in production)
    console.error(`[${request.method} ${request.url}] Error ${status}: ${errorResponse.error}`);

    response.status(status).json(errorResponse);
  }
}