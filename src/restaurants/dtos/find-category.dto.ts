import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/entities/output.entity';
import { Category } from '../entities/category.entity';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dto/pagination.dto';

@InputType()
export class FindCategoryInput extends PaginationInput {
  @Field((type) => String)
  slug: string;
}

@ObjectType()
export class FindCategoryOutput extends PaginationOutput {
  @Field(() => Category, { nullable: true })
  category?: Category;
}
