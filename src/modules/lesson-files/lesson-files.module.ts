import { Module } from '@nestjs/common';
import { LessonFilesService } from './lesson-files.service';
import { LessonFilesController } from './lesson-files.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
    imports: [CloudinaryModule],
    controllers: [LessonFilesController],
    providers: [LessonFilesService],
})
export class LessonFilesModule { }
