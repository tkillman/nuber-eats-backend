import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurants.entity';
import { Repository } from 'typeorm';
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
// import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(CategoryRepository)
    private readonly categories: CategoryRepository,
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
  }: FindCategoryInput): Promise<FindCategoryOutput> {
    try {
      const category = await this.categories.findOneOrFail({
        where: { slug },
        relations: ['restaurants'],
      });
      return {
        ok: true,
        category,
      };
    } catch (error) {
      return {
        ok: false,
        error: '카테고리를 찾을 수 없습니다.',
      };
    }
  }
}
