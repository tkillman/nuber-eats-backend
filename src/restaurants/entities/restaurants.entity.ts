import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Category } from './category.entity';
import { User } from 'src/users/entites/user.entity';
import { Dish } from './dish.entity';
import { Order } from 'src/orders/entities/order.entity';

// ObjectType, Field 는 그래프큐엘용도
// Entity, Column 은 TypeORM용도

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  // defaultValue를 사용하면 dto에 이미 세팅됨, resolver에서 console 찍으면 바로 세팅되어 있는거 확인 가능
  // Column에 default를 사용하면 dto에는 없어도 DB에 세팅됨
  // @Field(() => Boolean, { defaultValue: true })
  // @Column({ default: true })
  // @IsBoolean()
  // @IsOptional()
  // isVegan: boolean;

  @Field(() => String)
  @Column()
  @IsString()
  coverImage: string;

  @Field(() => String)
  @Column()
  @IsString()
  address: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.restaurants)
  user: User;

  @RelationId((restaurant: Restaurant) => restaurant.user)
  userId: number;

  @Field(() => [Dish], { nullable: true })
  @OneToMany(() => Dish, (dish) => dish.restaurant, {
    nullable: true,
  })
  menu?: Dish[];

  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.restaurant, {
    nullable: true,
  })
  orders?: Order[];

  @Field(() => Boolean)
  @Column({ default: false })
  @IsBoolean()
  isPromoted: boolean;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  promotedUntil?: Date;
}
