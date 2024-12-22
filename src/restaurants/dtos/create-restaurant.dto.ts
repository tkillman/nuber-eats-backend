import { ArgsType, Field, InputType, OmitType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { Restaurant } from '../entities/restaurants.entity';

// @InputType() inputType을 쓰면 객체명을 명시해야함, ArgsType은 객체가 풀어짐
// @ArgsType()
// export class CreateRestaurantDto {
//   @Field(() => String)
//   @IsString()
//   name: string;

//   @Field(() => Boolean)
//   @IsBoolean()
//   isVegan: boolean;

//   @Field(() => String)
//   @IsString()
//   address: string;

//   @Field(() => String)
//   @IsString()
//   @Length(5, 10)
//   ownerName: string;
// }

// 매번 Restaurant의 변화를 감지할 수 없으니까 이렇게 사용

@InputType()
export class CreateRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType,
) {}
