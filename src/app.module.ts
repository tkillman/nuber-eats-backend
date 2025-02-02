import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
//import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entites/user.entity';
import { JwtModule } from './jwt/jwt.module';
//import { jwtMiddleware } from './jwt/jwt.middleware';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entites/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurants/entities/restaurants.entity';
import { Category } from './restaurants/entities/category.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadsModule } from './uploads/uploads.module';
import { NaverModule } from './naver/naver.module';

const TOKEN_KEY = 'x-jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'production', 'test').required(),
        ...(!process.env.DATABASE_URL && {
          DB_HOST: Joi.string().required(),
          DB_PORT: Joi.string().required(),
          DB_USERNAME: Joi.string().required(),
          DB_PASSWORD: Joi.string().required(),
          DB_DATABASE: Joi.string().required(),
        }),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
        X_NCP_APIGW_API_KEY_ID: Joi.string().required(),
        X_NCP_APIGW_API_KEY: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? {
            url: process.env.DATABASE_URL,
          }
        : {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
          }),
      // synchronize가 true이면 디비를 자동으로 생성하므로 주의!!
      //synchronize: process.env.NODE_ENV !== 'production',
      synchronize: true,
      logging: process.env.NODE_ENV === 'dev',
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
        Payment,
      ],
    }),
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   //autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    //   autoSchemaFile: true,
    //   //subscribtion을 위한 설정
    //   installSubscriptionHandlers: true,
    //   // jwtMiddleware에서 req에 user를 넣어주기 때문에 가능
    //   context: ({ req, connection }) => {
    //     if (req) {
    //       return { user: req['user'] };
    //     } else {
    //       // 웹소켓 커넥션 시에는 req는 없고 connection이 있다.
    //       const { context } = connection;
    //       return { user: context['user'] };
    //     }
    //   },
    // }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      playground: process.env.NODE_ENV !== 'production',
      driver: ApolloDriver,
      //autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      autoSchemaFile: true,
      //subscribtion을 위한 설정
      installSubscriptionHandlers: true,
      subscriptions: {
        'subscriptions-transport-ws': {
          onConnect: (connectionParams) => {
            const token = connectionParams[TOKEN_KEY];

            return { token: token };
          },
        },
      },
      // jwtMiddleware에서 req에 user를 넣어주기 때문에 가능
      context: ({ req }) => {
        //console.log('req.headers', req.headers);
        const token = req.headers[TOKEN_KEY];
        //console.log('🚀 ~ token:', token);
        return {
          token: token,
        };
      },
    }),
    JwtModule.forRoot({
      PRIVATE_KEY: process.env.PRIVATE_KEY,
    }),
    UsersModule,
    // CommonModule,
    JwtModule,
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
    }),
    AuthModule,
    RestaurantsModule,
    OrdersModule,
    CommonModule,
    PaymentsModule,
    ScheduleModule.forRoot(),
    UploadsModule,
    NaverModule,
  ],
  controllers: [],
  providers: [],
})

// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(JwtMiddleware).forRoutes({
//       path: '/graphql',
//       method: RequestMethod.POST,
//     });
//   }
// }
export class AppModule {}
