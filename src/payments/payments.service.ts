import { Injectable } from '@nestjs/common';
import { LessThan, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { User } from 'src/users/entites/user.entity';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';
import { GetPaymentOutput } from './dtos/get-payment.dto';
import { Cron, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private schedulerRegistry: SchedulerRegistry,
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

      restaurant.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      restaurant.promotedUntil = date;

      await this.restaurants.save(restaurant);

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

  // https://docs.nestjs.com/techniques/task-scheduling
  // @Cron('30 * * * * *', {
  //   name: 'myJob',
  // })
  // checkForPayments() {
  //   console.log('Checking for payments... cron , 매분 30초에');
  // }

  // @Interval(5000)
  // checkForPaymentsI() {
  //   console.log('5초마다 실행');
  // }

  // @Timeout(10000)
  // afterStart() {
  //   console.log('어플리케이션이 시작되고 10초 뒤 딱 한번 실행');

  //   // 이런식으로 job을 중지도 가능
  //   this.schedulerRegistry.getCronJob('myJob').stop();
  // }

  //@Interval(2000)
  @Interval(20000)
  async checkPromotedRestaurants() {
    const restaurants = await this.restaurants.find({
      where: {
        isPromoted: true,
        promotedUntil: LessThan(new Date()),
      },
    });
    console.log(
      '🚀 ~ PaymentsService ~ checkPromotedRestaurants ~ restaurants:',
      restaurants,
    );

    restaurants.forEach(async (restaurant) => {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.restaurants.save(restaurant);
    });
  }
}
