import { Module } from '@nestjs/common';
import { ExamResultsService } from './exam-results.service';
import { ExamResultsController } from './exam-results.controller';

@Module({
    controllers: [ExamResultsController],
    providers: [ExamResultsService],
})
export class ExamResultsModule { }
