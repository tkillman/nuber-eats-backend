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
// import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
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
    let category: Category;
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.user = authUser;

      const slug = createRestaurantInput.categoryName
        .toLocaleLowerCase()
        .replace(/ /g, '-');
      category = await this.categories.findOne({ where: { slug: slug } });

      if (!category) {
        category = await this.categories.save(
          this.categories.create({
            slug,
            name: createRestaurantInput.categoryName,
          }),
        );
      }

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
    return {
      ok: true,
    };
  }
}
