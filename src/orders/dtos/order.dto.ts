import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { MutationOutput } from 'src/common/entities/output.entity';
import { Order, OrderStatus } from 'src/orders/entities/order.entity';

@InputType()
export class FindOrderInput extends PartialType(PickType(Order, ['status'])) {}

@ObjectType()
export class FindOrderOutput extends MutationOutput {
  @Field(() => [Order], { nullable: true })
  orders?: Order[];
}
