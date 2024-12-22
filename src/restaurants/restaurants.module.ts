import { Module } from '@nestjs/common';
import { ResutaurantsResolver } from './restaurants.resolver';
import { Restaurant } from './entities/restaurants.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsService } from './restaurants.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant])],
  providers: [ResutaurantsResolver, RestaurantsService],
})
export class RestaurantsModule {}
