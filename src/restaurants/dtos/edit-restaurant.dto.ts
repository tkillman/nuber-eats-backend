import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CreateRestaurantInputType } from './create-restaurant.dto';
import { MutationOutput } from 'src/common/entities/output.entity';

@InputType()
export class EditRestaurantInput extends PartialType(
  CreateRestaurantInputType,
) {
  @Field(() => Number)
  restaurantId: number;
}

@ObjectType()
export class EditRestaurantOutput extends MutationOutput {}
