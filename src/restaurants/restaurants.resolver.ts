import {
  Args,
  Int,
  Mutation,
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
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @ResolveField(() => Int)
  restaurantCount(): number {
    // ResolveField는 모든 응답에 computed field를 추가할 수 있음
    return 80;
  }

  @Query(() => AllCategoriesOutput)
  async allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantsService.allCategories();
  }
}
