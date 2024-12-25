import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../entites/user.entity';
import { MutationOutput } from 'src/common/entities/output.entity';

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class LoginOutput extends MutationOutput {
  @Field(() => String, { nullable: true })
  token?: string;
}
