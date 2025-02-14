import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../entites/user.entity';
import { MutationOutput } from 'src/common/entities/output.entity';

@InputType()
export class CreateUserInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

@ObjectType()
export class CreateUserOutput extends MutationOutput {}
