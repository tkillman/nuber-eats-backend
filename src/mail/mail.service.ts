import { CONFIG_OPTIONS } from 'src/common/common.constant';
import { EmailTemplate, MailModuleOptions } from './mail.interface';
import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    console.log('MailService created', options);
  }

  private async sendEmail(param: {
    subject: string;
    to: string;
    template: EmailTemplate;
    emailVars: { [key: string]: string }[];
  }) {
    const form = new FormData();
    form.append('from', `Excited User <mailgun@${this.options.domain}>`);
    // form.append(
    //   'to',
    //   'YOU@sandbox4e384cd510f54f65a5780bc94d05856e.mailgun.org',
    // );
    form.append('to', 'timekillman@gmail.com');
    form.append('subject', param.subject);
    //form.append('text', content);
    form.append('template', param.template);
    param.emailVars.forEach((emailVar) => {
      form.append(`v:${emailVar.key}`, emailVar.value);
    });

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

  async sendVerificationEmail(email: string, code: string) {
    this.sendEmail({
      subject: 'Verify Your Email',
      to: email,
      template: EmailTemplate.VERIFY_EMAIL,
      emailVars: [
        { key: 'code', value: code },
        { key: 'userName', value: email },
      ],
    });
  }
}
