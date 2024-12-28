import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { v4 } from 'uuid';
import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType('VerificationInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field(() => String)
  code: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @BeforeInsert()
  createCode(): void {
    this.code = v4();
  }
}
