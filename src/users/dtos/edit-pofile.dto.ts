import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { User } from '../entites/user.entity';
import { MutationOutput } from 'src/common/entities/output.entity';

@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password']),
) {}

@ObjectType()
export class EditProfileOutput extends MutationOutput {
  @Field(() => User, { nullable: true })
  user?: User;
}
