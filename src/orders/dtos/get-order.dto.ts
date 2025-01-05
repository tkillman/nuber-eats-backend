import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';
import { MutationOutput } from 'src/common/entities/output.entity';

@InputType()
export class GetOrderInput {
  @Field(() => Number)
  orderId: number;
}

@ObjectType()
export class GetOrderOutput extends MutationOutput {
  @Field(() => Order, { nullable: true })
  order?: Order;
}
