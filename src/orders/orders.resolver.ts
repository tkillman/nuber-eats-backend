import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User, UserRole } from 'src/users/entites/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';

import { FindOrderInput, FindOrderOutput } from './dtos/order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { PubSub } from 'graphql-subscriptions';
import { Inject } from '@nestjs/common';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATES,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constant';
import { OrderUpdatesInput } from './dtos/order-updates.dto';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @Mutation(() => CreateOrderOutput)
  @Role(['Client'])
  async createOrder(
    @AuthUser() client: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ) {
    return this.ordersService.createOrder(client, createOrderInput);
  }

  @Query(() => FindOrderOutput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') findOrderInput: FindOrderInput,
  ): Promise<FindOrderOutput> {
    return this.ordersService.getOrders(user, findOrderInput);
  }

  @Query(() => GetOrderOutput)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.ordersService.getOrder(user, getOrderInput);
  }

  @Mutation(() => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() authUser,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.ordersService.editOrder(authUser, editOrderInput);
  }

  @Mutation(() => Boolean)
  async potatoReady(@Args('potatoId') potatoId: number) {
    // publish 할때 object의 key값이 subscript의 mutation 함수이름과 같아야 한다.
    await this.pubSub.publish('hotPotatos', {
      readyPotatos: potatoId,
    });
    return true;
  }

  @Subscription(() => Order, {
    filter: (payload, _, context) => {
      return payload.pendingOrders.ownerId === context.user.id;
    },
    resolve: (payload) => {
      return payload.pendingOrders.order;
    },
  })
  @Role(['Owner'])
  pendingOrders() {
    return this.pubSub.asyncIterableIterator(NEW_PENDING_ORDER);
  }

  @Subscription(() => Order, {
    resolve: (payload) => {
      return payload.cookedOrders.order;
    },
  })
  @Role(['Delivery'])
  cookedOrders() {
    return this.pubSub.asyncIterableIterator(NEW_COOKED_ORDER);
  }

  @Subscription(() => Order, {
    filter: ({ orderUpdates }: { orderUpdates: Order }, { input }, context) => {
      if (
        orderUpdates.driverId !== context.user.id &&
        orderUpdates.customerId !== context.user.id &&
        orderUpdates.restaurant?.userId !== context.user.id
      ) {
        // 관련된 사람만 데이터를 받을 수 있게 처리
        // 이 부분은 orderUpdates의 asyncIterableIterator가 맺어지기 전에 방어 로직을 넣어 연결 불가시키는 방법도 좋다.

        return false;
      }

      return orderUpdates.id === input.id;
    },
  })
  @Role(['Any'])
  orderUpdates(@Args('input') orderUpdatesInput: OrderUpdatesInput) {
    return this.pubSub.asyncIterableIterator(NEW_ORDER_UPDATES);
  }

  @Mutation(() => TakeOrderOutput)
  @Role(['Delivery'])
  async takeOrder(
    @AuthUser() driver: User,
    @Args('input') { id }: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    return this.ordersService.takeOrder(driver, id);
  }
}
