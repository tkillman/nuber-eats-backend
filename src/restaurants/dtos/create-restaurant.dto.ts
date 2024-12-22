import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

// @InputType() inputType을 쓰면 객체명을 명시해야함, ArgsType은 객체가 풀어짐
@ArgsType()
export class CreateRestaurantDto {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => Boolean)
  @IsBoolean()
  isVegan: boolean;

  @Field(() => String)
  @IsString()
  address: string;

  @Field(() => String)
  @IsString()
  @Length(5, 10)
  ownerName: string;
}
