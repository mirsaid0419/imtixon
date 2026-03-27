import { Module } from '@nestjs/common';
import { SectionLessonsService } from './section-lessons.service';
import { SectionLessonsController } from './section-lessons.controller';

@Module({
    controllers: [SectionLessonsController],
    providers: [SectionLessonsService],
})
export class SectionLessonsModule { }
