import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AllowedRoles } from './role.decorator';
import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext) {
    // Role decorator에서 설정한 roles를 가져온다.
    const roles = this.reflector.get<AllowedRoles[]>(
      'roles',
      context.getHandler(),
    );

    if (!roles) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();

    const token = gqlContext['token'];

    if (token) {
      try {
        const decoded = this.jwtService.verify(token.toString());
        //console.log('decoded:', decoded);

        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          //console.log('decoded id:', decoded['id']);
          const { user } = await this.usersService.findById(decoded['id']);

          if (!user) {
            return false;
          }
          gqlContext['user'] = user; // req.user에 user를 넣어준다.

          if (roles.includes('Any')) {
            return true;
          }

          return roles.includes(user.role);
        }
      } catch (error) {
        //console.error(error?.message);
        return false;
      }
    }

    return false;
  }
}
