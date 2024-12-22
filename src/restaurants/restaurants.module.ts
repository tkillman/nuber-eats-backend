import { Module } from '@nestjs/common';
import { ResutaurantsResolver } from './restaurants.resolver';

@Module({
  providers: [ResutaurantsResolver],
})
export class RestaurantsModule {}
