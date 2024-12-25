import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interface';
import { CONFIG_OPTIONS } from './jwt.constant';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}

  sayHello(): void {
    console.log(`Hello from JWT service ${JSON.stringify(this.options)}`);
  }
}
