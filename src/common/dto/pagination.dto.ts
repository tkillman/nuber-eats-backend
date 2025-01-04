import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from '../entities/output.entity';

@InputType()
export class PaginationInput {
  @Field(() => Number, { defaultValue: 1 })
  page: number;

  @Field(() => Number, { defaultValue: 5 })
  pageSize: number;
}

@ObjectType()
export class PaginationOutput extends MutationOutput {
  @Field(() => Number, { nullable: true })
  totalPages?: number;
}
