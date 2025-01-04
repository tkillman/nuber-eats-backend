import { Module } from '@nestjs/common';
import { CategoryResolver, ResutaurantsResolver } from './restaurants.resolver';
import { Restaurant } from './entities/restaurants.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsService } from './restaurants.service';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './repositories/category.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository])],
  providers: [
    ResutaurantsResolver,
    CategoryResolver,
    RestaurantsService,
    CategoryRepository,
  ],
})
export class RestaurantsModule {}
