import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';
import { MutationOutput } from 'src/common/entities/output.entity';

@InputType()
export class CreateOrderInput extends PickType(Order, ['items']) {
  @Field(() => Number)
  restaurantId: number;
}

@ObjectType()
export class CreateOrderOutput extends MutationOutput {}
