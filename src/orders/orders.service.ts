import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/users/entites/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { FindOrderInput, FindOrderOutput } from './dtos/order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';

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

      let totalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const item of createOrderInput.items) {
        const dish = await this.dishes.findOne({ where: { id: item.dishId } });

        let dishTotalPrice = 0;
        if (!dish) {
          return {
            ok: false,
            error: '메뉴를 찾을 수 없습니다.',
          };
        }

        let extraPrice = 0;

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
                  // console.log('dishChoice', dishChoice);
                  extraPrice += dishChoice.extra;
                }
              }
            }
          }
        }

        dishTotalPrice = dish.price + extraPrice;
        console.log('dishTotalPrice', dishTotalPrice);
        const orderItem = await this.orderItems.save(
          this.orderItems.create({ dish, options: item.options }),
        );
        totalPrice += dishTotalPrice;
        orderItems.push(orderItem);
      }

      await this.orders.save(
        this.orders.create({
          customer: user,
          restaurant: restaurant,
          items: orderItems,
          total: totalPrice,
        }),
      );

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

  async getOrders(
    user: User,
    findOrderInput: FindOrderInput,
  ): Promise<FindOrderOutput> {
    let orders: Order[];
    try {
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: {
            customer: user,
            ...findOrderInput,
          },
        });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: {
            driver: user,
            ...findOrderInput,
          },
        });
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: {
            user: user,
          },
          relations: ['orders'],
        });
        orders = restaurants.map((restaurant) => restaurant.orders).flat(1);
        if (findOrderInput.status) {
          orders = orders.filter(
            (order) => order.status === findOrderInput.status,
          );
        }
      }
      return {
        ok: true,
        orders,
      };
    } catch (error) {
      return {
        ok: false,
        error: '주문을 찾을 수 없습니다.',
      };
    }
  }

  private canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Owner && order.restaurant.userId !== user.id) {
      canSee = false;
    }
    return canSee;
  }

  async getOrder(
    user: User,
    getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne({
        where: { id: getOrderInput.orderId },
        relations: ['restaurant'],
      });
      if (!order) {
        return {
          ok: false,
          error: '주문을 찾을 수 없습니다.',
        };
      }
      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: '주문을 볼 수 없습니다.',
        };
      }
      return {
        ok: true,
        order,
      };
    } catch (error) {
      return {
        ok: false,
        error: '주문을 찾을 수 없습니다.',
      };
    }
  }
}