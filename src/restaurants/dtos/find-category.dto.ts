import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/entities/output.entity';
import { Category } from '../entities/category.entity';

@InputType()
export class FindCategoryInput {
  @Field((type) => String)
  slug: string;
}

@ObjectType()
export class FindCategoryOutput extends MutationOutput {
  @Field(() => Category, { nullable: true })
  category?: Category;
}
