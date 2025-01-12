import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';
import { MutationOutput } from 'src/common/entities/output.entity';

@InputType()
export class TakeOrderInput extends PickType(Order, ['id']) {}

@ObjectType()
export class TakeOrderOutput extends MutationOutput {}
