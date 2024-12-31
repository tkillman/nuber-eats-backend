import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/entities/output.entity';
import { User } from '../entites/user.entity';

@ArgsType()
export class UserProfileInput {
  @Field(() => Number)
  userId: number;
}

@ObjectType()
export class UserProfileOutput extends MutationOutput {
  @Field(() => User, { nullable: true })
  user?: User;
}
