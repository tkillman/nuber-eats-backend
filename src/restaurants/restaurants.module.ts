import { Module } from '@nestjs/common';
import {
  CategoryResolver,
  DishResolver,
  ResutaurantsResolver,
} from './restaurants.resolver';
import { Restaurant } from './entities/restaurants.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsService } from './restaurants.service';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './repositories/category.repository';
import { Dish } from './entities/dish.entity';
import { NaverService } from 'src/naver/naver.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository, Dish])],
  providers: [
    ResutaurantsResolver,
    CategoryResolver,
    DishResolver,
    RestaurantsService,
    CategoryRepository,
    NaverService,
  ],
})
export class RestaurantsModule {}
