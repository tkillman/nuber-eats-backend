import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entites/user.entity';
import { Verification } from './entites/verification.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dtos/create-user.dto';
import { LoginInput } from './dtos/login.dto';

// 객체로 사용해버리면 user와 verification이 같은 함수로 인식되어 버림
// const mockRepository = {
//   find: jest.fn(),
//   findOne: jest.fn(),
//   save: jest.fn(),
//   create: jest.fn(),
// };

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
});

const mockJwtService = {
  sayHello: jest.fn(),
  sign: jest.fn(() => 'signed-token-baby'),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UsersService;
  //let usersRepository: Partial<Record<'hello', number>>;
  let usersRepository: MockRepository<User>;
  let verificationRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  //beforeAll을 쓰면 toHaveBeenCalledTimes가 공유되버린다.
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('정의됐는지 확인', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const createUserArgs: CreateUserInput = {
      email: '',
      password: '',
      role: 0,
    };

    it('[실패]유저존재', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: '',
      });

      const result = await service.createUser(createUserArgs);

      expect(result).toMatchObject({
        ok: false,
        error: '이미 존재하는 이메일입니다.',
      });
    });

    it('[성공]', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createUserArgs);
      usersRepository.save.mockResolvedValue(createUserArgs);
      verificationRepository.create.mockReturnValue({ user: createUserArgs });
      verificationRepository.save.mockResolvedValue({
        user: createUserArgs,
        code: 'code',
      });

      const result = await service.createUser(createUserArgs);

      // mockRepository를 객체로 사용하면
      // user와 verification이 같은 함수로 인식되어 버림
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createUserArgs);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createUserArgs);

      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: createUserArgs,
      });

      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith({
        user: createUserArgs,
      });
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );

      expect(result).toEqual({ ok: true });
    });

    it('[실패]에러발생', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());

      const result = await service.createUser(createUserArgs);

      expect(result).toEqual({
        ok: false,
        error: '계정을 생성할 수 없습니다.',
      });
    });
  });

  describe('loginUser', () => {
    const loginUserArgs: LoginInput = {
      email: '',
      password: '',
    };

    it('[실패]유저없음', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);

      const result = await service.loginUser(loginUserArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object));

      expect(result).toEqual({
        ok: false,
        error: '유저를 찾을 수 없습니다.',
      });
    });

    it('[실패]비밀번호 불일치', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);

      const result = await service.loginUser(loginUserArgs);

      expect(result).toEqual({
        ok: false,
        error: '비밀번호가 일치하지 않습니다.',
      });
    });

    it('[성공]', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.loginUser(loginUserArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));

      expect(result).toEqual({
        ok: true,
        token: 'signed-token-baby',
      });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };
    it('[성공]유저존재', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({ ok: true, user: findByIdArgs });
    });

    it('[실패]유저없음', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());

      const result = await service.findById(1);

      expect(result).toEqual({
        ok: false,
        error: '유저를 찾을 수 없습니다.',
      });
    });
  });
});
