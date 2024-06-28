import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as geolib from 'geolib';
import axios from 'axios';
describe('AuthService', () => {
  let authService: AuthService;
  let authRepository: Repository<Auth>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Auth),
          useValue: {
            save: jest.fn().mockResolvedValue(new Auth()),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authRepository = module.get(getRepositoryToken(Auth));
  });

  describe('create', () => {
    it('should create a user and generate a token', async () => {
      const createAuthDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        latitude: 30.8760568,
        longitude: 29.742604,
        city: 'Cairo',
      };

      jest.spyOn(authRepository, 'save').mockResolvedValueOnce(new Auth());
      jest.spyOn(geolib, 'isPointInPolygon').mockReturnValue(true);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

      const result = await authService.create(createAuthDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(authRepository.save).toHaveBeenCalledWith(expect.any(Object));
      expect(geolib.isPointInPolygon).toHaveBeenCalledWith(expect.arrayContaining([29.742604, 30.8760568]), expect.any(Array));
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    });

    it('should throw an error if the coordinates are not in Egypt', async () => {
      const createAuthDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        latitude: 40.712776, // Coordinates outside Egypt
        longitude: -74.005974,
        city: 'New York',
      };

      jest.spyOn(authRepository, 'save').mockResolvedValueOnce(new Auth());
      jest.spyOn(geolib, 'isPointInPolygon').mockReturnValue(false);

      await expect(authService.create(createAuthDto)).rejects.toThrow('Longitude and Latitude are not in Egypt');
    });
  });
});
