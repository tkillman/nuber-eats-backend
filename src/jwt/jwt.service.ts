import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interface';
import { CONFIG_OPTIONS } from './jwt.constant';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
    private readonly configService: ConfigService,
  ) {}

  sayHello(): void {
    console.log(`Hello from JWT service ${JSON.stringify(this.options)}`);
  }

  sign(id: number): string {
    // configService를 사용해도 되는데 연습상 options를 주입해서 사용
    //return jwt.sign({ id }, this.configService.get('PRIVATE_KEY'));
    return jwt.sign({ id }, this.options.PRIVATE_KEY);
  }
}