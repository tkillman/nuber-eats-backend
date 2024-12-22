import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

// ObjectType, Field 는 그래프큐엘용도
// Entity, Column 은 TypeORM용도

@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  // defaultValue를 사용하면 dto에 이미 세팅됨, resolver에서 console 찍으면 바로 세팅되어 있는거 확인 가능
  // Column에 default를 사용하면 dto에는 없어도 DB에 세팅됨
  @Field(() => Boolean, { defaultValue: true })
  @Column({ default: true })
  @IsBoolean()
  @IsOptional()
  isVegan: boolean;

  @Field(() => String)
  @Column()
  @IsString()
  address: string;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 10)
  ownerName: string;

  @Field(() => String)
  @Column()
  @IsString()
  categoryName: string;
}
