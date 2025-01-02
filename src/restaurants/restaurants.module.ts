import { Module } from '@nestjs/common';
import { ResutaurantsResolver } from './restaurants.resolver';
import { Restaurant } from './entities/restaurants.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsService } from './restaurants.service';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category])],
  providers: [ResutaurantsResolver, RestaurantsService],
})
export class RestaurantsModule {}
