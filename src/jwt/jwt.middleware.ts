import { Inject, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { JwtService } from './jwt.service';
import { UsersService } from 'src/users/users.service';

export class JwtMiddleware implements NestMiddleware {
  constructor(
    @Inject() private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    //console.log(req.headers);
    if ('x-jwt' in req.headers) {
      console.log('jwt exists');
      const token = req.headers['x-jwt'];
      const decoded = this.jwtService.verify(token.toString());
      console.log('decoded:', decoded);
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        console.log('decoded id:', decoded['id']);
        try {
          const user = await this.usersService.findById(decoded['id']);
          req['user'] = user; // req.user에 user를 넣어준다.
        } catch (error) {
          console.error(error);
        }
      }
    }

    next();
  }
}

// export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
//   console.log(req.headers);

//   next();
// }
