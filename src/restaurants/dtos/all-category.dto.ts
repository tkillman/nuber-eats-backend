import { Field, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/entities/output.entity';
import { Category } from '../entities/category.entity';

@ObjectType()
export class AllCategoriesOutput extends MutationOutput {
  @Field(() => [Category], { nullable: true })
  categories?: Category[];
}
