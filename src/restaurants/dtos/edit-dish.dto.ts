import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { MutationOutput } from 'src/common/entities/output.entity';
import { Dish } from '../entities/dish.entity';

@InputType()
export class EditDishInput extends PartialType(
  PickType(Dish, ['name', 'price', 'photo', 'description', 'options']),
) {
  @Field(() => Number)
  dishId: number;
}

@ObjectType()
export class EditDishOutput extends MutationOutput {}
