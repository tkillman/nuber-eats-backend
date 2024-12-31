import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entites/user.entity';
import { Verification } from './entites/verification.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dtos/create-user.dto';
import exp from 'constants';

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
});

const mockJwtService = {
  sayHello: jest.fn(),
  sign: jest.fn(),
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

  beforeAll(async () => {
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

    it('유저가 있다면 실패해야함', async () => {
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

    it('유저가 없다면 성공해야함', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createUserArgs);

      await service.createUser(createUserArgs);

      // mockRepository를 객체로 사용하면
      // user와 verification이 같은 함수로 인식되어 버림
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createUserArgs);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createUserArgs);
    });
  });

  it.todo('createUser');
});
