import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurants.entity';
import { MutationOutput } from 'src/common/entities/output.entity';

@InputType()
export class RestaurantInput {
  @Field(() => Number)
  restaurantId: number;
}

@ObjectType()
export class RestaurantOutput extends MutationOutput {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
