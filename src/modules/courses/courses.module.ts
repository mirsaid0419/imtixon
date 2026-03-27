import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
  imports: [CloudinaryModule],
})
export class CoursesModule {}
