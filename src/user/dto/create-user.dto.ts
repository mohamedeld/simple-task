import {
  IsAlphanumeric,
  IsEmail,
  IsEnum,
  IsInt,
  IsDecimal,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: 'Name must have atleast 2 characters.' })
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail(null, { message: 'Please provide valid Email.' })
  email: string;

  @IsNotEmpty()
  @IsDecimal({decimal_digits:"2"})
  latitude:number;

  @IsNotEmpty()
  @IsDecimal({decimal_digits:"2"})
  longitude:number;

  @IsNotEmpty()
  @IsString()
  city: string;

  
}