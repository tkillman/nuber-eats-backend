import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entites/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
  ) {}

  async createOrder(
    user: User,
    createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      await this.orders.save(
        this.orders.create({
          ...createOrderInput,
          customer: user,
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
}
