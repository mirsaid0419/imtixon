import { Module } from '@nestjs/common';
import { StudentExamQuestionsService } from './student-exam-questions.service';
import { StudentExamQuestionsController } from './student-exam-questions.controller';

@Module({
    controllers: [StudentExamQuestionsController],
    providers: [StudentExamQuestionsService],
})
export class StudentExamQuestionsModule { }
