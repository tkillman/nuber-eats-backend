import { Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurants.entity';

@Resolver((of) => Restaurant)
export class ResutaurantsResolver {
  @Query(() => Restaurant)
  myRestaurant() {
    return true;
  }
}
