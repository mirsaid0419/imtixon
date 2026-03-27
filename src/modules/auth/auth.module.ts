import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/core/database/prsima.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [PrismaModule, CloudinaryModule],
})
export class AuthModule {}
