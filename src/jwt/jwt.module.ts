import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtModuleOptions } from './jwt.interface';
import { CONFIG_OPTIONS } from 'src/common/common.constant';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      exports: [JwtService],
      // 다 같은 provider로 제공하는 방법
      //providers: [JwtService],
      // providers: [
      //   {
      //     provide: JwtService,
      //     useClass: JwtService,
      //   },
      // ],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        JwtService,
      ],
    };
  }
}
