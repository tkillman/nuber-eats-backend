import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entites/user.entity';
import { Injectable } from '@nestjs/common';
import { CreateUserInput, CreateUserOutput } from './dtos/create-user.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
// import { ConfigService } from '@nestjs/config';

// import * as jwt from 'jsonwebtoken';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-pofile.dto';
import { Verification } from './entites/verification.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    // private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    console.log('UsersService created');
    this.jwtService.sayHello();
  }

  async createUser({
    email,
    password,
    role,
  }: CreateUserInput): Promise<CreateUserOutput> {
    // 유저 생성

    try {
      // 이메일 중복확인
      const exists = await this.users.findOne({ where: { email: email } });
      console.log('exists', exists);
      if (exists) {
        // 에러 발생
        return { ok: false, error: '이미 존재하는 이메일입니다.' };
      }

      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );

      this.verifications.save(
        this.verifications.create({ user: user, code: '123' }),
      );

      return { ok: true };
    } catch (error) {
      // 에러 발생
      console.error(error);
      return { ok: false, error: '계정을 생성할 수 없습니다.' };
    }
  }

  async loginUser({ email, password }: LoginInput): Promise<LoginOutput> {
    // 유저 확인
    // 패스워드 확인
    try {
      const user = await this.users.findOne({ where: { email } });
      if (!user) {
        return {
          ok: false,
          error: '유저를 찾을 수 없습니다.',
        };
      }
      const isSamePw = await user.checkPassword(password);

      if (!isSamePw) {
        return {
          ok: false,
          error: '비밀번호가 일치하지 않습니다.',
        };
      }

      // const token = jwt.sign(
      //   { id: user.id },
      //   this.configService.get('SECKRET_KEY'),
      // );
      const token = this.jwtService.sign(user.id);

      return {
        ok: true,
        token: token,
      };
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        error: '로그인 할 수 없습니다.',
      };
    }
  }

  async findById(id: number): Promise<User> {
    return this.users.findOne({ where: { id } });
  }

  async editProfile(id: number, editProfileInput: EditProfileInput) {
    // update는 객체 키가 존재하는지 확인하지 않고 바로 쿼리 업데이트를 수행
    // 따라서 @BeforeUpdate() 데코레이터가 동작하지 않음
    // 패스워드가 해시화되지 않고 그대로 저장됨.
    //return this.users.update({ id }, { ...editProfileInput });

    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      return;
    }

    if (editProfileInput.email) {
      user.email = editProfileInput.email;
      user.verified = false;
      this.verifications.save(this.verifications.create({ user: user }));
    }

    if (editProfileInput.password) {
      user.password = editProfileInput.password;
    }

    return this.users.save(user);
  }
}
