import { CONFIG_OPTIONS } from 'src/common/common.constant';
import { MailModuleOptions } from './mail.interface';
import { Inject } from '@nestjs/common';

export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    console.log('MailService created');
  }
}
