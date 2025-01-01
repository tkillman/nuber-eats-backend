import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { EmailTemplate, MailModuleOptions } from './mail.interface';
import { CONFIG_OPTIONS } from 'src/common/common.constant';
import * as FormData from 'form-data';
import axios from 'axios';

jest.mock('axios');

jest.mock('form-data');

const options: MailModuleOptions = {
  apiKey: '',
  domain: '',
  fromEmail: '',
};

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('[성공]', async () => {
      /*중요한 부분
      sendEmail 함수를 mock으로 만들수도 있지만
      sendEmail은 테스트할 부분이기 때문에 spyOn을 사용한다.
      */
      // service.sendEmail = jest.fn();
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => {
        console.log('i love u');
        return true;
      });

      const result = await service.sendVerificationEmail('email', 'code');
      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith({
        subject: 'Verify Your Email',
        to: 'email',
        template: EmailTemplate.VERIFY_EMAIL,
        emailVars: [
          { key: 'code', value: 'code' },
          { key: 'userName', value: 'email' },
        ],
      });
    });
  });

  describe('sendEmail', () => {
    it('[성공]', async () => {
      jest.spyOn(axios, 'post').mockImplementation(async () => {
        return {};
      });

      const result = await service.sendEmail({
        subject: 'Verify Your Email',
        to: 'email',
        template: EmailTemplate.VERIFY_EMAIL,
        emailVars: [
          { key: 'code', value: 'code' },
          { key: 'userName', value: 'email' },
        ],
      });
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      expect(formSpy).toHaveBeenCalled();
      //expect(FormData.prototype.append).toHaveBeenCalledTimes(6);
      //expect(result).toEqual(true);

      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.any(Object),
      );

      expect(result).toEqual(true);
    });

    it('[실패]', async () => {
      jest.spyOn(axios, 'post').mockImplementation(async () => {
        throw new Error();
      });

      const result = await service.sendEmail({
        subject: 'Verify Your Email',
        to: 'email',
        template: EmailTemplate.VERIFY_EMAIL,
        emailVars: [
          { key: 'code', value: 'code' },
          { key: 'userName', value: 'email' },
        ],
      });

      expect(result).toEqual(false);
    });
  });
});
