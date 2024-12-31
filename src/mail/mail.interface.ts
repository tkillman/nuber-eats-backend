export interface MailModuleOptions {
  apiKey: string;
  domain: string;
  fromEmail: string;
}

export enum EmailTemplate {
  VERIFY_EMAIL = 'verify-email',
}

export enum VerifyEmailVar {
  CODE = 'code',
  USERNAME = 'userName',
}

export type EmailVar = {
  key: string;
  value: string;
};
