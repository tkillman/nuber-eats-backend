import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurants.entity';
import { Like, Raw, Repository } from 'typeorm';
import {
  // CreateRestaurantDto,
  CreateRestaurantInputType,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { User } from 'src/users/entites/user.entity';
import { Category } from './entities/category.entity';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';
import { DeleteRestaurantOutput } from './dtos/delete-restaurant.dto';
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
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import { Dish } from './entities/dish.entity';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import { DeleteDishInput } from './dtos/delete-dish.dto';

// import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(CategoryRepository)
    private readonly categories: CategoryRepository,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  // getAll(): Promise<Restaurant[]> {
  //   return this.restaurants.find();
  // }

  // createRestaurant(
  //   createRestaurantDto: CreateRestaurantDto,
  // ): Promise<Restaurant> {
  //   const newRestaurant = this.restaurants.create(createRestaurantDto);
  //   return this.restaurants.save(newRestaurant);
  // }

  // updateRestaurant({ id, data }: UpdateRestaurantDto) {
  //   return this.restaurants.update(id, { ...data });
  // }

  async createRestaurant(
    authUser: User,
    createRestaurantInput: CreateRestaurantInputType,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.user = authUser;

      const category = await this.categories.getOrCreateCategory(
        createRestaurantInput.categoryName,
      );

      newRestaurant.category = category;

      await this.restaurants.save(newRestaurant);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: error,
      };
    }
  }

  async editRestaurant(
    user: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: editRestaurantInput.restaurantId },
      });

      if (user.id !== restaurant.userId) {
        return {
          ok: false,
          error: '당신의 레스토랑이 아닙니다.',
        };
      }

      let category: Category = null;

      if (editRestaurantInput.categoryName) {
        console.log('this.categories');
        category = await this.categories.getOrCreateCategory(
          editRestaurantInput.categoryName,
        );
      }

      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          ...(category && { category }),
        },
      ]);

      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error,
      };
    }
  }

  async deleteRestaurant(
    user: User,
    restaurantId: number,
  ): Promise<DeleteRestaurantOutput> {
    await this.restaurants.delete({ id: restaurantId, userId: user.id });
    return { ok: true };
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch (error) {
      return {
        ok: false,
        error: `카테고리를 불러오는데 실패했습니다. ${error}`,
      };
    }
  }

  async countRestaurants(category: Category) {
    return this.restaurants.count({
      where: {
        category: {
          id: category.id,
        },
      },
    });
  }

  async findCategoryBySlug({
    slug,
    page,
    pageSize,
  }: FindCategoryInput): Promise<FindCategoryOutput> {
    console.log('slug', slug, 'page', page, 'pageSize', pageSize);
    try {
      const category = await this.categories.findOneOrFail({
        where: { slug },
      });

      const restaurants = await this.restaurants.find({
        where: {
          category: {
            id: category.id,
          },
        },
        take: pageSize,
        skip: (page - 1) * pageSize,
        order: {
          isPromoted: 'DESC',
        },
      });

      category.restaurants = restaurants;
      const totalResults = await this.countRestaurants(category);

      return {
        ok: true,
        category,
        totalPages: Math.ceil(totalResults / pageSize),
      };
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        error: '카테고리를 찾을 수 없습니다.',
      };
    }
  }

  async allRestaurants(
    input: AllRestaurantInput,
  ): Promise<AllRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        take: input.pageSize,
        skip: (input.page - 1) * input.pageSize,
        order: {
          isPromoted: 'DESC',
        },
      });

      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / input.pageSize),
        totalResults: totalResults,
      };
    } catch (error) {
      return {
        ok: false,
        error: `레스토랑을 불러오는데 실패했습니다. ${error}`,
      };
    }
  }

  async restaurantById(input: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOneOrFail({
        where: { id: input.restaurantId },
      });

      return {
        ok: true,
        restaurant,
      };
    } catch (error) {
      return {
        ok: false,
        error: `레스토랑을 찾을 수 없습니다. ${error}`,
      };
    }
  }

  async searchRestaurants(
    input: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          name: Like(`%${input.query}%`),
        },
        take: input.pageSize,
        skip: (input.page - 1) * input.pageSize,
      });

      return {
        ok: true,
        totalPages: Math.ceil(totalResults / input.pageSize),
        totalResults,
        restaurants,
      };
    } catch (error) {
      return {
        ok: false,
        error: `레스토랑을 찾을 수 없습니다. ${error}`,
      };
    }
  }

  async createDish(
    user: User,
    input: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: input.restaurantId },
      });

      if (!restaurant) {
        return {
          ok: false,
          error: '레스토랑을 찾을 수 없습니다.',
        };
      }

      if (user.id !== restaurant.userId) {
        return {
          ok: false,
          error: '당신의 레스토랑이 아닙니다.',
        };
      }

      await this.dishes.save(this.dishes.create({ ...input, restaurant }));

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async editDish(
    user: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne({
        where: { id: editDishInput.dishId },
        relations: ['restaurant'],
      });

      if (!dish) {
        return {
          ok: false,
          error: '음식을 찾을 수 없습니다.',
        };
      }

      if (user.id !== dish.restaurant.userId) {
        return {
          ok: false,
          error: '당신의 음식이 아닙니다.',
        };
      }

      await this.dishes.save([
        {
          id: editDishInput.dishId,
          ...editDishInput,
        },
      ]);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async deleteDish(user: User, deleteDishInput: DeleteDishInput) {
    try {
      const dish = await this.dishes.findOne({
        where: { id: deleteDishInput.dishId },
        relations: ['restaurant'],
      });

      if (!dish) {
        return {
          ok: false,
          error: '음식을 찾을 수 없습니다.',
        };
      }

      if (user.id !== dish.restaurant.userId) {
        return {
          ok: false,
          error: '당신의 음식이 아닙니다.',
        };
      }

      await this.dishes.delete(deleteDishInput.dishId);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
