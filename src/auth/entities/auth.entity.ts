import { Column,Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Auth {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 30 })
  name: string;

  @ApiProperty()
  @Column({type:'varchar'})
  email:string;

  @ApiProperty()
  @Column({type:'varchar'})
  password:string;

  @ApiProperty()
  @Column({type:'decimal'})
  latitude:number;

  @ApiProperty()
  @Column({type:'decimal'})
  longitude:number;

  @ApiProperty()
  @Column({type:'varchar'})
  city: string;
}
