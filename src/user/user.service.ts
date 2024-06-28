import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as geolib from 'geolib';
import { GeolibInputCoordinates } from 'geolib/es/types';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
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

  /**
   * this is function is used to create User in User Entity.
   * @param createUserDto this will type of createUserDto in which
   * we have defined what are the keys we are expecting from body
   * @returns promise of user
   */
  async create(createUserDto: CreateUserDto):Promise<{ user: User; accessToken: string }> {
    const { name, email,latitude, longitude,city } = createUserDto;

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
    const user = new User();
    user.name = name;
    user.email = email;
    user.longitude = longitude;
    user.latitude = latitude;
    user.city = derivedCity;
    const savedUser = await this.userRepository.save(user); 
    const payload = { username: createUserDto.email }; // Customize the payload as needed
    const token = this.jwtService.sign(payload, { expiresIn: '1h' });
    
    return {
      user:savedUser,
      accessToken: token
    }
  }
 /**
   * this function is used to get all the user's list
   * @returns promise of array of users
   */
  findAll():Promise<User[]> {
    return this.userRepository.find();
  }
/**
   * this function used to get data of use whose id is passed in parameter
   * @param id is type of number, which represent the id of user.
   * @returns promise of user
   */
  findOne(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }
/**
   * this function used to check email is already in use or not
   * @param id is type of number, which represent the id of user.
   * @returns promise of user
   */
  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOneBy({ email });
  }
  /**
   * this function is used to updated specific user whose id is passed in
   * parameter along with passed updated data
   * @param id is type of number, which represent the id of user.
   * @param updateUserDto this is partial type of createUserDto.
   * @returns promise of udpate user
   */
  update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { name, email, latitude, longitude,city } = updateUserDto;
    const point:GeolibInputCoordinates  = [longitude, latitude];
    // Check if latitude and longitude are within Egypt's boundaries
    const egyptBounds:GeolibInputCoordinates[] = [
      [-37.5, 22.0], // West, South
      [35.5, 31.0], // East, North
    ];
    if (!geolib.isPointInPolygon(point, egyptBounds)) {
      throw new Error('Longitude and Latitude are not in Egypt');
    }
    const user = new User();
    user.name = name;
    user.email = email;
    user.longitude = longitude;
    user.latitude = latitude;
    user.city = city;
    user.id = id;
    return this.userRepository.save(user);
  }
/**
   * this function is used to remove or delete user from database.
   * @param id is the type of number, which represent id of user
   * @returns nuber of rows deleted or affected
   */
  remove(id: number): Promise<{ affected?: number }>{
    return this.userRepository.delete(id);
  }
}
