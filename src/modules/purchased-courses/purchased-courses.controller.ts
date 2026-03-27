import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Req,
    ParseIntPipe,
} from '@nestjs/common';
import { PurchasedCoursesService } from './purchased-courses.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Purchased Courses (Kurs sotib olish)')
@Controller('purchased-courses')
@UseGuards(TokenGuard, RoleGuard)
@ApiBearerAuth("token")
export class PurchasedCoursesController {
    constructor(private readonly purchasedCoursesService: PurchasedCoursesService) { }

    @ApiOperation({ summary: "Kurs sotib olish (Faqat talaba)" })
    @Post('initiate')
    @Roles(UserRole.STUDENT)
    initiatePurchase(@Req() req, @Body() dto: CreatePurchaseDto) {
        return this.purchasedCoursesService.purchase(req.user.id, dto);
    }

    @ApiOperation({ summary: "Talabaning o'z xaridlar ro'yxatini ko'rish" })
    @Get('my')
    @Roles(UserRole.STUDENT)
    getMyPurchases(@Req() req) {
        return this.purchasedCoursesService.getMyPurchases(req.user.id);
    }

    @ApiOperation({ summary: "Talabaning barcha to'lovlar tarixini ko'rish (Admin)" })
    @Get('all/:userId')
    @Roles(UserRole.ADMIN)
    getUserPurchases(@Param('userId', ParseIntPipe) userId: number) {
        return this.purchasedCoursesService.getUserPurchases(userId);
    }
}
