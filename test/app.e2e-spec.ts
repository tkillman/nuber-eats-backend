import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource, getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entites/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

jest.mock('axios');

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
  email: 'timekillman@gmail.com',
  password: '1234',
};

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource; /* 추가된 코드 */
  let jwtToken: string;
  let userRepositry: Repository<User>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    dataSource = module.get(DataSource); /* 추가된 코드 */
    userRepositry = module.get(getRepositoryToken(User));
    await app.init();
  });

  afterAll(async () => {
    await dataSource?.dropDatabase(); /* 추가된 코드 */
    await app.close();
  });

  describe('createUser', () => {
    it('유저생성', async () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              createUser(input : {
                email : "${testUser.email}",
                password : "${testUser.password}",
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
          expect(res.body.data.createUser.error).toEqual(null);
        });
    });

    it('[실패] 유저 중복', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              createUser(input : {
                email : "${testUser.email}",
                password : "${testUser.password}",
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

  describe('login', () => {
    it('[성공] 로그인', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              login(input : {
                email : "${testUser.email}",
                password : "${testUser.password}"
              }){
                error
                ok
                token
              }
            }
        `,
        })
        .expect(200)
        .expect((res) => {
          console.log('🚀 ~ .expect ~ res.body.data', res.body.data);
          expect(res.body.data.login.ok).toEqual(true);
          expect(res.body.data.login.error).toEqual(null);
          expect(res.body.data.login.token).toEqual(expect.any(String));
          jwtToken = res.body.data.login.token;
        });
    });

    it('[실패] 유저 없음', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              login(input : {
                email : "${testUser.email}123",
                password : "${testUser.password}"
              }){
                error
                ok
                token
              }
            }
        `,
        })
        .expect(200)
        .expect((res) => {
          console.log('🚀 ~ .expect ~ res.body.data', res.body.data);
          expect(res.body.data.login.ok).toEqual(false);
          expect(res.body.data.login.error).toEqual(expect.any(String));
          expect(res.body.data.login.token).toEqual(null);
        });
    });
    it('[실패] 비밀번호 틀림', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation {
              login(input : {
                email : "${testUser.email}",
                password : "${testUser.password}123"
              }){
                error
                ok
                token
              }
            }
        `,
        })
        .expect(200)
        .expect((res) => {
          console.log('🚀 ~ .expect ~ res.body.data', res.body.data);
          expect(res.body.data.login.ok).toEqual(false);
          expect(res.body.data.login.error).toEqual(expect.any(String));
          expect(res.body.data.login.token).toEqual(null);
        });
    });
  });

  describe('userProfile', () => {
    let users: User[] = [];

    beforeAll(async () => {
      // e2e 테스트시에 직접 디비 조회도 가능
      users = await userRepositry.find();
    });

    it('[성공] 유저 프로필 조회', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', `${jwtToken}`)
        .send({
          query: `
            query {
              userProfile(userId : ${users[0].id}){
                error
                ok
                user {
                  id
                  email
                }
              }
            }
        `,
        })
        .expect(200)
        .expect((res) => {
          console.log('🚀 ~ .expect ~ res.body.data', res.body.data);
          expect(res.body.data.userProfile.ok).toEqual(true);
          expect(res.body.data.userProfile.error).toEqual(null);
          expect(res.body.data.userProfile.user.email).toEqual(testUser.email);
        });
    });

    it('[실패] 유저 프로필 조회', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT', `${jwtToken}`)
        .send({
          query: `
            query {
              userProfile(userId : 2){
                error
                ok
                user {
                  id
                  email
                }
              }
            }
        `,
        })
        .expect(200)
        .expect((res) => {
          console.log('🚀 ~ .expect ~ res.body.data', res.body.data);
          expect(res.body.data.userProfile.ok).toEqual(false);
          expect(res.body.data.userProfile.error).toEqual(expect.any(String));
          expect(res.body.data.userProfile.user).toEqual(null);
        });
    });
  });
});
