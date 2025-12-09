import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global pipe for DTO validation
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true,
    forbidNonWhitelisted: true
  }));

  // Global filter for handling all exceptions (Requisito 3 / 4)
  // This needs to be provided globally to catch all errors from controllers and services
  app.useGlobalFilters(new AllExceptionsFilter());

  
  // --- Swagger Documentation Configuration ---
  const config = new DocumentBuilder()
    .setTitle('PDNest API')
    .setDescription('API REST for managing support tickets (NestJS, TypeORM, JWT)')
    .setVersion('1.0')
    // Enable JWT authorization header in Swagger UI
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token', // This name is used to reference the scheme in operations
    )
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Access docs at http://localhost:3000/api/docs

  await app.listen(3000);
}
bootstrap();