import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/entities/output.entity';
import { Restaurant } from '../entities/restaurants.entity';

@InputType()
export class MyRestaurantInput {
  @Field((type) => Number, { nullable: true })
  restaurantId: number;
}

@ObjectType()
export class MyRestaurantOutput extends MutationOutput {
  @Field((type) => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
