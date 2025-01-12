import { Field, ObjectType } from '@nestjs/graphql';
import { Payment } from '../entities/payment.entity';
import { MutationOutput } from 'src/common/entities/output.entity';

@ObjectType()
export class GetPaymentOutput extends MutationOutput {
  @Field(() => [Payment], { nullable: true })
  payments?: Payment[];
}
