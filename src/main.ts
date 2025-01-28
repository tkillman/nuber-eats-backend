import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { IMAGE_FOLDER } from './common/common.constant';
//import { jwtMiddleware } from './jwt/jwt.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({}));
  //app.use(jwtMiddleware);
  app.enableCors();

  // 정적 파일 제공 경로 설정
  // http://localhost:4000/images/file-1738055100602-673100375.jpg
  app.useStaticAssets(join(__dirname, '..', 'images'), {
    prefix: `/${IMAGE_FOLDER}/`, // URL prefix (선택 사항)
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
