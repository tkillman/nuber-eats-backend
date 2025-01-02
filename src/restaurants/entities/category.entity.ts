import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Restaurant } from './restaurants.entity';

// ObjectType, Field 는 그래프큐엘용도
// Entity, Column 은 TypeORM용도

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  name: string;

  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  // defaultValue를 사용하면 dto에 이미 세팅됨, resolver에서 console 찍으면 바로 세팅되어 있는거 확인 가능
  // Column에 default를 사용하면 dto에는 없어도 DB에 세팅됨
  // @Field(() => Boolean, { defaultValue: true })
  // @Column({ default: true })
  // @IsBoolean()
  // @IsOptional()
  // isVegan: boolean;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImage: string;

  @Field(() => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant) => restaurant.category)
  restaurants: Restaurant[];
}
