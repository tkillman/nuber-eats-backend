import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entites/user.entity';
import { Injectable, Query } from '@nestjs/common';
import { CreateUserInput, CreateUserOutput } from './dtos/create-user.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
// import { ConfigService } from '@nestjs/config';

// import * as jwt from 'jsonwebtoken';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-pofile.dto';
import { Verification } from './entites/verification.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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

      const verification = await this.verifications.save(
        this.verifications.create({ user: user }),
      );

      this.mailService.sendVerificationEmail(user.email, verification.code);

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
      // select: ['password']를 통해 password를 강제로 가져오게
      // 패스워드가 select: false로 설정되어 있어서 기본적으로는 가져오지 않음
      const user = await this.users.findOne({
        where: { email },
        select: ['id', 'password'],
      });
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
      const verification = await this.verifications.save(
        this.verifications.create({ user: user }),
      );

      this.mailService.sendVerificationEmail(user.email, verification.code);
    }

    if (editProfileInput.password) {
      user.password = editProfileInput.password;
    }

    return this.users.save(user);
  }

  async verifyEmail(code: string): Promise<boolean> {
    //typeorm에서 relations는 객체 전체를 가져옴
    // loadRelationIds는 해당 객체의 id만 가져옴
    const verification = await this.verifications.findOneOrFail({
      where: { code },
      relations: ['user'],
    });

    if (verification) {
      console.log('verification', verification.user);
      verification.user.verified = true;
      // 여기서 저장하다가 패스워드가 2번 해시화되는 오류 발생
      // step1. @Column({ select: false })로 select 할 때 password를 제외
      // step2. hashPassword 함수는 객체에 패스워드가 존재할때만
      this.users.save(verification.user);
      this.verifications.delete(verification.id);
      return true;
    }

    return false;
  }
}
