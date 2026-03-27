import { Module } from '@nestjs/common';
import { MentorProfilesService } from './mentor-profiles.service';
import { MentorProfilesController } from './mentor-profiles.controller';
import { PrismaModule } from 'src/core/database/prsima.module';

@Module({
  controllers: [MentorProfilesController],
  providers: [MentorProfilesService],
  imports:[PrismaModule]
})
export class MentorProfilesModule {}
