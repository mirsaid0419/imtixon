import { Module } from '@nestjs/common';
import { LastActivityService } from './last-activity.service';
import { LastActivityController } from './last-activity.controller';

@Module({
    controllers: [LastActivityController],
    providers: [LastActivityService],
})
export class LastActivityModule { }
