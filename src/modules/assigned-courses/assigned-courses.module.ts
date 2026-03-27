import { Module } from '@nestjs/common';
import { AssignedCoursesService } from './assigned-courses.service';
import { AssignedCoursesController } from './assigned-courses.controller';

@Module({
    controllers: [AssignedCoursesController],
    providers: [AssignedCoursesService],
})
export class AssignedCoursesModule { }
