import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Restaurant } from './entities/restaurants.entity';
//import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { RestaurantsService } from './restaurants.service';
// import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import {
  CreateRestaurantInputType,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
// import { AuthGuard } from 'src/auth/auth.guard';
// import { UseGuards } from '@nestjs/common';
import { Role } from 'src/auth/role.decorator';
import { UserRole } from 'src/users/entites/user.entity';

import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { DeleteRestaurantOutput } from './dtos/delete-restaurant.dto';
import { Category } from './entities/category.entity';
import { AllCategoriesOutput } from './dtos/all-category.dto';
import {
  FindCategoryInput,
  FindCategoryOutput,
} from './dtos/find-category.dto';
import {
  AllRestaurantInput,
  AllRestaurantOutput,
} from './dtos/all-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Dish } from './entities/dish.entity';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';

@Resolver(() => Restaurant)
export class ResutaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  // @Query(() => [Restaurant])
  // restaurants(): Promise<Restaurant[]> {
  //   return this.restaurantsService.getAll();
  // }

  // @Mutation(() => Boolean)
  // async createRestaurant(
  //   // @Args('name') name: string,
  //   // @Args('isVegan') isVegan: boolean,
  //   // @Args('address') address: string,
  //   // @Args('ownerName') ownerName: string,
  //   @Args('input') createRestaurantInput: CreateRestaurantDto,
  // ): Promise<boolean> {
  //   console.log(createRestaurantInput);
  //   try {
  //     await this.restaurantsService.createRestaurant(createRestaurantInput);
  //     return true;
  //   } catch (error) {
  //     console.log(error);
  //     return false;
  //   }
  // }

  // @Mutation(() => Boolean)
  // async updateRestaurant(
  //   @Args() updateRestaurantDto: UpdateRestaurantDto,
  // ): Promise<boolean> {
  //   console.log(updateRestaurantDto);

  //   try {
  //     await this.restaurantsService.updateRestaurant(updateRestaurantDto);
  //     return true;
  //   } catch (error) {
  //     console.log(error);
  //     return false;
  //   }
  //   return true;
  // }

  @Mutation(() => CreateRestaurantOutput)
  @Role([UserRole.Owner])
  async createRestaurant(
    @AuthUser() authUser,
    @Args('input') createRestaurantInput: CreateRestaurantInputType,
  ): Promise<CreateRestaurantOutput> {
    try {
      return await this.restaurantsService.createRestaurant(
        authUser,
        createRestaurantInput,
      );
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  @Mutation(() => EditRestaurantOutput)
  @Role([UserRole.Owner])
  async editRestaurant(
    @AuthUser() authUser,
    @Args('input') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return await this.restaurantsService.editRestaurant(
      authUser,
      editRestaurantInput,
    );
    return {
      ok: true,
    };
  }

  @Mutation(() => DeleteRestaurantOutput)
  async deleteRestaurant(
    @AuthUser() authUser,
    @Args('restaurantId') restaurantId: number,
  ): Promise<DeleteRestaurantOutput> {
    return await this.restaurantsService.deleteRestaurant(
      authUser,
      restaurantId,
    );
  }

  @Query(() => AllRestaurantOutput)
  async allRestaurants(
    @Args('input') allRestaurantInput: AllRestaurantInput,
  ): Promise<AllRestaurantOutput> {
    return this.restaurantsService.allRestaurants(allRestaurantInput);
  }

  @Query(() => RestaurantOutput)
  async Restaurant(
    @Args('input') RestaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    return this.restaurantsService.restaurantById(RestaurantInput);
  }

  @Query(() => SearchRestaurantOutput)
  async searchRestaurants(
    @Args('input') searchRestaurantInput: SearchRestaurantInput,
  ) {
    return this.restaurantsService.searchRestaurants(searchRestaurantInput);
  }

  @Query(() => MyRestaurantsOutput)
  @Role([UserRole.Owner])
  async myRestaurants(@AuthUser() authUser): Promise<MyRestaurantsOutput> {
    return this.restaurantsService.myRestaurants(authUser);
  }
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @ResolveField(() => Int)
  async restaurantCount(@Parent() parent: Category): Promise<number> {
    // ResolveField는 모든 응답에 computed field를 추가할 수 있음
    return this.restaurantsService.countRestaurants(parent);
  }

  @Query(() => AllCategoriesOutput)
  async allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantsService.allCategories();
  }

  @Query(() => FindCategoryOutput)
  async findCategory(
    @Args('input') findCategoryInput: FindCategoryInput,
  ): Promise<FindCategoryOutput> {
    return this.restaurantsService.findCategoryBySlug(findCategoryInput);
  }
}

@Resolver(() => Dish)
export class DishResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Mutation(() => CreateDishOutput)
  @Role([UserRole.Owner])
  async createDish(
    @AuthUser() authUser,
    @Args('input') createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    return this.restaurantsService.createDish(authUser, createDishInput);
  }

  @Mutation(() => EditDishOutput)
  @Role([UserRole.Owner])
  async editDish(
    @AuthUser() authUser,
    @Args('input') editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    return this.restaurantsService.editDish(authUser, editDishInput);
  }

  @Mutation(() => DeleteDishOutput)
  @Role([UserRole.Owner])
  async deleteDish(
    @AuthUser() authUser,
    @Args('input') deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    return this.restaurantsService.deleteDish(authUser, deleteDishInput);
  }
}
