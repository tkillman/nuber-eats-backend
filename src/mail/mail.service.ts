import { CONFIG_OPTIONS } from 'src/common/common.constant';
import { MailModuleOptions } from './mail.interface';
import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    console.log('MailService created', options);
    this.sendEmail('test', 'test11');
  }

  private async sendEmail(subject: string, content: string) {
    console.log('Send email o', subject, content);
    const form = new FormData();
    form.append('from', `Excited User <mailgun@${this.options.domain}>`);
    // form.append(
    //   'to',
    //   'YOU@sandbox4e384cd510f54f65a5780bc94d05856e.mailgun.org',
    // );
    form.append('to', 'timekillman@gmail.com');
    form.append('subject', subject);
    form.append('text', content);
    form.append('template', 'verify-email');
    form.append('v:code', '1234');
    form.append('v:userName', 'nico');
    console.log(form);
    try {
      const response = await axios.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        form,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
        },
      );
      console.log('response', response.data);
    } catch (error) {
      console.error(error);
    }
  }
}
