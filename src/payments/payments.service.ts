import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { User } from 'src/users/entites/user.entity';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';
import { GetPaymentOutput } from './dtos/get-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  async createPayment(
    owner: User,
    input: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: input.restaurantId },
      });

      if (!restaurant) {
        return {
          ok: false,
          error: '레스토랑이 없습니다.',
        };
      }

      if (restaurant.userId !== owner.id) {
        return {
          ok: false,
          error: '레스토랑 주인이 아닙니다.',
        };
      }

      await this.payments.save(
        this.payments.create({
          transactionId: input.transactionId,
          user: owner,
          restaurant,
        }),
      );

      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: 'Could not create payment',
      };
    }
  }

  async getPayments(owner: User): Promise<GetPaymentOutput> {
    try {
      const payments = await this.payments.find({
        where: {
          user: {
            id: owner.id,
          },
        },
      });
      console.log('🚀 ~ PaymentsService ~ getPayments ~ payments:', payments);

      return {
        ok: true,
        payments,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: error,
      };
    }
  }
}
