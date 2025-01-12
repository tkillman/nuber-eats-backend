import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/users/entites/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { FindOrderInput, FindOrderOutput } from './dtos/order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATES,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constant';
import { PubSub } from 'graphql-subscriptions';
import { TakeOrderOutput } from './dtos/take-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish) private readonly dishes: Repository<Dish>,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
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

      const order = await this.orders.save(
        this.orders.create({
          customer: user,
          restaurant: restaurant,
          items: orderItems,
          total: totalPrice,
        }),
      );
      console.log('메시지 보내기', order);
      await this.pubSub.publish(NEW_PENDING_ORDER, {
        pendingOrders: { order, ownerId: restaurant.userId },
      });

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

    if (user.role === UserRole.Owner && order.restaurant?.userId !== user.id) {
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
      console.log('🚀 ~ OrdersService ~ order:', order);
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

  async editOrder(
    user: User,
    editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne({
        where: { id: editOrderInput.id },
        // eager : true 옵션으로 자동으로 가져옴, lazyEager는 await로 값을 호출(await order.restaurant)하면 불러와짐
        // relations: ['restaurant', 'items'],
      });
      console.log('🚀 ~ OrdersService ~ order:', order);
      if (!order) {
        return {
          ok: false,
          error: '주문을 찾을 수 없습니다.',
        };
      }
      console.log('user', user.role, 'order', order.status);
      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: '주문을 볼 수 없습니다.',
        };
      }

      let canEdit = false;

      if (user.role === UserRole.Owner) {
        if (
          order.status === OrderStatus.Pending ||
          order.status === OrderStatus.Cooking ||
          order.status === OrderStatus.Cooked
        ) {
          canEdit = true;
        }
      }

      if (user.role === UserRole.Delivery) {
        if (
          order.status === OrderStatus.PickUp ||
          order.status === OrderStatus.Delivered
        ) {
          canEdit = true;
        }
      }

      if (!canEdit) {
        return {
          ok: false,
          error: '주문을 수정할 수 있는 상태가 아닙니다.',
        };
      }

      await this.orders.save({
        id: editOrderInput.id,
        status: editOrderInput.status,
      });

      const newOrder = { ...order, status: editOrderInput.status };
      if (editOrderInput.status === OrderStatus.Cooked) {
        await this.pubSub.publish(NEW_COOKED_ORDER, {
          cookedOrders: {
            order: newOrder,
          },
        });
      }

      await this.pubSub.publish(NEW_ORDER_UPDATES, {
        orderUpdates: newOrder,
      });

      return { ok: true };
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        error: '주문을 수정할 수 없습니다.',
      };
    }
  }

  async takeOrder(driver: User, id: number): Promise<TakeOrderOutput> {
    try {
      const order = await this.orders.findOne({
        where: {
          id: id,
        },
      });

      if (!order) {
        return {
          ok: false,
          error: '주문을 찾을 수 없습니다.',
        };
      }

      if (order.driver) {
        return {
          ok: false,
          error: '이미 배달원이 배정되었습니다.',
        };
      }

      await this.orders.save({
        id: id,
        driver,
      });

      const newOrder = { ...order, driver };
      await this.pubSub.publish(NEW_ORDER_UPDATES, {
        orderUpdates: newOrder,
      });

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
}
