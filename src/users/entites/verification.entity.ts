import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { CoreEntity } from 'src/common/entities/core.entity';

@Entity()
export class Verification extends CoreEntity {
  @Column()
  code: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
