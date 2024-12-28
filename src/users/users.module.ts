import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entites/user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { Verification } from './entites/verification.entity';
// global이 설정되어 있기 때문에 구지 imports에 넣지 않아도 된다.
//import { ConfigService } from '@nestjs/config';

@Module({
  //imports: [TypeOrmModule.forFeature([User]), ConfigService],
  imports: [TypeOrmModule.forFeature([User, Verification])],
  providers: [UsersResolver, UsersService],
  exports: [UsersService], // jwt.mddileware에서 사용하기 위해 export
})
export class UsersModule {}
