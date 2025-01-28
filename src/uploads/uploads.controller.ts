import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream, existsSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { IMAGE_FOLDER } from 'src/common/common.constant';

@Controller('uploads')
export class UploadsController {
  @Post('')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: `./${IMAGE_FOLDER}`, // 파일 저장 디렉토리
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file) {
    console.log(file.filename);

    // http://localhost:4000/images/file-1738055100602-673100375.jpg
    return {
      message: 'File uploaded successfully!',
      url: `http://localhost:4000/images/${file.filename}`,
    };
  }
}
