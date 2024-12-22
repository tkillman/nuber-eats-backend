import { Args, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurants.entity';

@Resolver(() => Restaurant)
export class ResutaurantsResolver {
  @Query(() => [Restaurant])
  restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] {
    console.log(veganOnly);
    return [];
  }
}
