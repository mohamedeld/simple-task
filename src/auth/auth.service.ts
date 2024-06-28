import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { GeolibInputCoordinates } from 'geolib/es/types';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as geolib from 'geolib';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private readonly authRepository: Repository<Auth>,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async getCityFromCoords(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
      const result = response.data.address.city || response.data.address.town;
      return result;
    } catch (error) {
      console.error('Failed to fetch city:', error.message);
      return '';
    }
  }
 async create(createAuthDto: CreateAuthDto):Promise<{user:Auth,accessToken:string}> {
    const { name, email,password,latitude, longitude,city } = createAuthDto;
    const existingUser = await this.userService.findOneByEmail(email);
    if (existingUser) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: 'Email is already in use',
      },HttpStatus.BAD_REQUEST)
    }
    const point:GeolibInputCoordinates  = [latitude, longitude];
    // Check if latitude and longitude are within Egypt's boundaries
    console.log(point)
    const egyptBounds:GeolibInputCoordinates[] = [
      [22.0, 24.5], // South-West corner
      [31.5, 24.5], // South-East corner
      [31.5, 36.0], // North-East corner
      [22.0, 36.0], // North-West corner
      [22.0, 24.5] // South-West corner (repeat the first point to close the polygon)
    ];
    if (!geolib.isPointInPolygon({ latitude: latitude, longitude: longitude }, egyptBounds)) {
      throw new Error('Longitude and Latitude are not in Egypt');
    }
    const derivedCity = await this.getCityFromCoords(latitude, longitude);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Auth();
    user.name = name;
    user.email = email;
    user.password=hashedPassword;
    user.longitude = longitude;
    user.latitude = latitude;
    user.city = derivedCity;
    const savedUser = await this.authRepository.save(user); 
    const payload = { username: createAuthDto.email }; // Customize the payload as needed
    const token = this.jwtService.sign(payload, { secret:"welcoemeingap123123@",expiresIn: '1h' });
    
    return {
      user:savedUser,
      accessToken: token
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
