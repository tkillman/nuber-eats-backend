# Nuber

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
