import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entites/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Mutation(() => Boolean)
  @Role(['Client'])
  async createOrder(
    @AuthUser() client: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(client, createOrderInput);
  }
}
