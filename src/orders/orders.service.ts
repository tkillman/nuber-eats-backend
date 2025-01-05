import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entites/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish) private readonly dishes: Repository<Dish>,
  ) {}

  async createOrder(
    user: User,
    createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: createOrderInput.restaurantId },
      });

      if (!restaurant) {
        return {
          ok: false,
          error: '레스토랑을 찾을 수 없습니다.',
        };
      }

      for (const item of createOrderInput.items) {
        const dish = await this.dishes.findOne({ where: { id: item.dishId } });

        if (!dish) {
          return {
            ok: false,
            error: '메뉴를 찾을 수 없습니다.',
          };
        }

        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (option) => option.name === itemOption.name,
          );
          if (dishOption) {
            if (dishOption) {
              const dishChoice = dishOption.choices.find(
                (choice) => choice.name === itemOption.choice,
              );
              if (dishChoice) {
                if (dishChoice.extra) {
                  // dishChoice.extra
                  console.log('dishChoice', dishChoice);
                }
              }
            }
          }
        }

        // await this.orderItems.save(
        //   this.orderItems.create({ dish, options: item.options }),
        // );
      }

      // await this.orders.save(
      //   this.orders.create({
      //     ...createOrderInput,
      //     customer: user,
      //   }),
      // );

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: `주문을 생성할 수 없습니다. ${error}`,
      };
    }
  }
}
