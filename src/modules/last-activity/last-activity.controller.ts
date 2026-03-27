import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Req,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { LastActivityService } from './last-activity.service';
import { UpdateLastActivityDto } from './dto/last-activity.dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Last Activity (Oxirgi foydalanuvchi faoliyati)')
@Controller('last-activity')
@UseGuards(TokenGuard)
@ApiBearerAuth('token')
export class LastActivityController {
    constructor(private readonly lastActivityService: LastActivityService) { }

    @ApiOperation({ summary: "Foydalanuvchining oxirgi faoliyatini qayd etish/yangilash" })
    @Post()
    update(@Req() req, @Body() dto: UpdateLastActivityDto) {
        return this.lastActivityService.updateActivity(req.user.id, dto);
    }

    @ApiOperation({ summary: "Foydalanuvchining ma'lum bir kursdagi oxirgi faoliyatini olish" })
    @Get(':courseId')
    getLastActivity(
        @Req() req,
        @Param('courseId', ParseIntPipe) courseId: number,
    ) {
        return this.lastActivityService.getLastActivity(req.user.id, courseId);
    }
}
