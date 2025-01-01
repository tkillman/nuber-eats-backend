import { Test } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import { ConfigService } from '@nestjs/config';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import { JwtModuleOptions } from './jwt.interface';

const options: JwtModuleOptions = { PRIVATE_KEY: '' };

describe('JwtService', () => {
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
      ],
    }).compile();
    const service: JwtService = module.get<JwtService>(JwtService);

    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  it.todo('sign');
  it.todo('verify');
});
