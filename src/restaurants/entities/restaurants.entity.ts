import { Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';

// ObjectType, Field 는 그래프큐엘용도
// Entity, Column 은 TypeORM용도

@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryColumn()
  @Field(() => Number)
  id: number;

  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  @Field(() => Boolean)
  @Column()
  @IsBoolean()
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
