import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { Auth } from './entities/auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';

@Module({
  imports:[TypeOrmModule.forFeature([Auth]),UserModule],
  controllers: [AuthController],
  providers: [AuthService,JwtService],
  
})
export class AuthModule {}
