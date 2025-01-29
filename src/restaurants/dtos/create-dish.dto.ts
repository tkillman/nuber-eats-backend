import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Dish } from '../entities/dish.entity';
import { MutationOutput } from 'src/common/entities/output.entity';

@InputType()
export class CreateDishInput extends PickType(Dish, [
  'name',
  'price',
  'description',
  'options',
]) {
  @Field(() => Number)
  restaurantId: number;

  @Field(() => String, { nullable: true })
  photo?: string;
}

@ObjectType()
export class CreateDishOutput extends MutationOutput {}
