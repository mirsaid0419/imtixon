import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { MentorProfilesModule } from './modules/mentor-profiles/mentor-profiles.module';
import { CourseCategoryModule } from './modules/course-category/course-category.module';
import { CoursesModule } from './modules/courses/courses.module';
import { AssignedCoursesModule } from './modules/assigned-courses/assigned-courses.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { PurchasedCoursesModule } from './modules/purchased-courses/purchased-courses.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { SectionLessonsModule } from './modules/section-lessons/section-lessons.module';
import { LessonFilesModule } from './modules/lesson-files/lesson-files.module';
import { HomeworkModule } from './modules/homework/homework.module';
import { HomeworkSubmissionsModule } from './modules/homework-submissions/homework-submissions.module';
import { ExamsModule } from './modules/exams/exams.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { StudentExamQuestionsModule } from './modules/student-exam-questions/student-exam-questions.module';
import { ExamResultsModule } from './modules/exam-results/exam-results.module';
import { LastActivityModule } from './modules/last-activity/last-activity.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      global: true, // MANA SHU JOYI GLOBAL QILADI
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' }, // 1 kunlik muddat
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CloudinaryModule,
    MulterModule.register({
      limits: {
        fileSize: 100 * 1024 * 1024
      }
    }),
    MentorProfilesModule,
    CourseCategoryModule,
    CoursesModule,
    AssignedCoursesModule,
    PurchasedCoursesModule,
    RatingsModule,
    SectionLessonsModule,
    LessonsModule,
    LessonFilesModule,
    HomeworkModule,
    HomeworkSubmissionsModule,
    ExamsModule,
    QuestionsModule,
    StudentExamQuestionsModule,
    ExamResultsModule,
    LastActivityModule
  ],
})
export class AppModule { }
