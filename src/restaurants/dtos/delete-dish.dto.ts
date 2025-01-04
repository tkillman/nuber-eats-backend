import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/entities/output.entity';

@InputType()
export class DeleteDishInput {
  @Field(() => Number)
  dishId: number;
}

@ObjectType()
export class DeleteDishOutput extends MutationOutput {}
