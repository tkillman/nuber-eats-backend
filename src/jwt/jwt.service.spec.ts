import { Test } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import { ConfigService } from '@nestjs/config';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import { JwtModuleOptions } from './jwt.interface';
import * as jwt from 'jsonwebtoken';

// 해당 내용이 없으면 jsonwebtoken library를 실제로 사용
// unit test로 library로 부터 독립시키기 위해 mock을 사용
jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => 'TOKEN'),
    verify: jest.fn(() => ({ id: 1 })),
  };
});
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

const options: JwtModuleOptions = { PRIVATE_KEY: '' };

describe('JwtService', () => {
  let service: JwtService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => 'test-key'),
          },
        },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('[성공]', () => {
      const result = service.sign(1);
      console.log('result', result);
      expect(typeof result).toBe('string');
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, options.PRIVATE_KEY);
    });
  });

  describe('verify', () => {
    it('[성공]', () => {
      const result = service.verify('TOKEN');
      console.log('result', result);
      expect(result).toEqual({ id: 1 });
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith('TOKEN', options.PRIVATE_KEY);
    });
  });
});
