import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurants.entity';
import { Order } from 'src/orders/entities/order.entity';

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
export class DishChoice {
  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => Number, { nullable: true })
  extra: number;
}

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
export class DishOption {
  @Field(() => String)
  name: string;

  @Field(() => [DishChoice], { nullable: true })
  choices?: DishChoice[];

  // @Field(() => Number, { nullable: true })
  // extra: number;
}

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  //@Length(5)
  name: string;

  @Field(() => Number)
  @Column()
  @IsNumber()
  price: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo?: string;

  @Field(() => String)
  @Column({ nullable: true })
  @IsString()
  //@Length(5, 140)
  description: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  @Field(() => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];
}
