import { ArgsType, Field, InputType } from '@nestjs/graphql';

// @InputType() inputType을 쓰면 객체명을 명시해야함, ArgsType은 객체가 풀어짐
@ArgsType()
export class CreateRestaurantDto {
  @Field(() => String)
  name: string;

  @Field(() => Boolean)
  isVegan: boolean;

  @Field(() => String)
  address: string;

  @Field(() => String)
  ownerName: string;
}
