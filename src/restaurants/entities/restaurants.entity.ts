import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';

// ObjectType, Field 는 그래프큐엘용도
// Entity, Column 은 TypeORM용도

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

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 10)
  ownerName: string;

  @Field(() => Category)
  @ManyToOne(() => Category, (category) => category.restaurants)
  category: Category;
}
