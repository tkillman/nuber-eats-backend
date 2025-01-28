import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/entities/output.entity';
import { Restaurant } from '../entities/restaurants.entity';

@ObjectType()
export class MyRestaurantsOutput extends MutationOutput {
  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}
