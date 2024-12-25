import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entites/user.entity';
import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async createUser({
    email,
    password,
    role,
  }: CreateUserInput): Promise<[boolean, string?]> {
    // 유저 생성

    try {
      // 이메일 중복확인
      const exists = await this.users.findOne({ where: { email: email } });
      console.log('exists', exists);
      if (exists) {
        // 에러 발생
        return [false, '이미 존재하는 이메일입니다.'];
      }

      await this.users.save(this.users.create({ email, password, role }));
      return [true];
    } catch (error) {
      // 에러 발생
      console.error(error);
      return [false, '계정을 생성할 수 없습니다.'];
    }
  }
}
