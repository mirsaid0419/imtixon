import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from 'src/core/database/prsima.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports:[CloudinaryModule,PrismaModule]
})
export class UsersModule {}
