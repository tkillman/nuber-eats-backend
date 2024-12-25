import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtService {
  sayHello(): void {
    console.log('Hello from JWT service');
  }
}
