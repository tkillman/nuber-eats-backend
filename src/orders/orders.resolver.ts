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
import { PUB_SUB } from 'src/common/common.constant';

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

  @Subscription(() => String, {
    filter: (payload, variables, context) => {
      console.log('🚀 ~ OrdersResolver ~ filter ~ payload', payload);
      console.log('🚀 ~ OrdersResolver ~ filter ~ variables', variables);
      console.log('🚀 ~ OrdersResolver ~ filter ~ context', context);
      return variables.potatoId === payload.readyPotatos;
    },
  })
  @Role(['Any'])
  readyPotatos(@AuthUser() user: User, @Args('potatoId') potatoId: number) {
    console.log('🚀 ~ OrdersResolver ~ readyPotatos ~ user:', user);

    return this.pubSub.asyncIterableIterator('hotPotatos');
  }
}
