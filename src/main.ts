import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
//import { jwtMiddleware } from './jwt/jwt.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({}));
  //app.use(jwtMiddleware);
  app.enableCors();
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
