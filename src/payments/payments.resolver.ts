import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { Role } from 'src/auth/role.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entites/user.entity';
import { GetPaymentOutput } from './dtos/get-payment.dto';

@Resolver((of) => Payment)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Role(['Owner'])
  @Mutation((returns) => CreatePaymentOutput)
  async createPayment(
    @AuthUser() owner: User,
    @Args('input') input: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    return this.paymentsService.createPayment(owner, input);
  }

  @Role(['Owner'])
  @Query(() => GetPaymentOutput)
  async getPayments(@AuthUser() user: User): Promise<GetPaymentOutput> {
    return this.paymentsService.getPayments(user);
  }
}
