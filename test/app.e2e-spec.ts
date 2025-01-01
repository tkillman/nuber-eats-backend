import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource, getConnection } from 'typeorm';

jest.mock('axios');

const GRAPHQL_ENDPOINT = '/graphql';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource; /* 추가된 코드 */

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get(DataSource); /* 추가된 코드 */
    await app.init();
  });

  afterAll(async () => {
    await dataSource?.dropDatabase(); /* 추가된 코드 */
    await app.close();
  });

  describe('createUser', () => {
    const email = 'timekillman@gmail.com';

    it('유저생성', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              createUser(input : {
                email : "${email}",
                password : "1234",
                role : Client
              }){
                error
                ok
              }
            }
        `,
        })
        .expect(200)
        .expect((res) => {
          console.log('🚀 ~ .expect ~ res:', res.body.data);
          expect(res.body.data.createUser.ok).toEqual(true);
        });
    });

    it('[실패] 유저 중복', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              createUser(input : {
                email : "${email}",
                password : "1234",
                role : Client
              }){
                error
                ok
              }
            }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createUser.ok).toEqual(false);
          expect(res.body.data.createUser.error).toEqual(expect.any(String));
        });
    });
  });
});
