import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurants.entity';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { RestaurantsService } from './restaurants.service';
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';

@Resolver(() => Restaurant)
export class ResutaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Query(() => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantsService.getAll();
  }

  @Mutation(() => Boolean)
  async createRestaurant(
    // @Args('name') name: string,
    // @Args('isVegan') isVegan: boolean,
    // @Args('address') address: string,
    // @Args('ownerName') ownerName: string,
    @Args('input') createRestaurantInput: CreateRestaurantDto,
  ): Promise<boolean> {
    console.log(createRestaurantInput);
    try {
      await this.restaurantsService.createRestaurant(createRestaurantInput);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  @Mutation(() => Boolean)
  async updateRestaurant(
    @Args() updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<boolean> {
    console.log(updateRestaurantDto);

    try {
      await this.restaurantsService.updateRestaurant(updateRestaurantDto);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  }
}
