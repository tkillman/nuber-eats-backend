import { Global, Module } from '@nestjs/common';
import { PUB_SUB } from './common.constant';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();
@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: PUB_SUB,
      useValue: pubSub,
    },
  ],
  exports: [PUB_SUB],
})
export class CommonModule {}
