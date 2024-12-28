import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Verification } from '../entites/verification.entity';
import { MutationOutput } from 'src/common/entities/output.entity';

@InputType()
export class VerifyEmailInput extends PickType(Verification, ['code']) {}

@ObjectType()
export class VerifyEmailOutput extends MutationOutput {}
