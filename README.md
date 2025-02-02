# Nuber

npm i -g @nestjs/cli

# nest -v <br/>

- 10.4.9

# 모듈 생성

- nest g mo users
- nest g mo orders
- nest g mo payments

# CreateDateColumn, UpdateDateColumn 두 개는 스페셜 컬럼

https://orkhan.gitbook.io/typeorm/docs/decorator-reference#createdatecolumn

# static module이란 설정이 없어서 forRoot 없음

# dynamic module이란 설정이 있어서 forRoot 있음

# Middlewares in NestJS 강의는 중요

# middleware 설정 순서

src\app.module.ts

src\jwt\jwt.middleware.ts => request header의 토큰에서 user를 찾아서 request의 user에 바인딩

src\app.module.ts => graphql context에 세팅

src\auth\role.decorator.ts => resolver에서 사용 가능한 유저 role을 명시

src\auth\auth.guard.ts에 의해 (reflector 사용) 사용가능한 role 추출하고 user의 role과 비교

# Cron

https://docs.nestjs.com/techniques/task-scheduling
npm install --save @nestjs/schedule

# postgresql docker

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=example
DB_DATABASE=postgres

# postgresql ui

localhost:8080

# file upload

https://docs.nestjs.com/techniques/file-upload

# ngrok

npx ngrok http 4000

# db docker 시작

docker compose up -d

# 배포

git push heroku master

# Db ssl 배포 오류

heroku config에 설정

https://stackoverflow.com/questions/61097695/self-signed-certificate-error-during-query-the-heroku-hosted-postgres-database
PGSSLMODE=no-verify
