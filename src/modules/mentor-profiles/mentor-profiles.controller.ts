import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { MentorProfilesService } from './mentor-profiles.service';
import { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';
import { UpdateMentorProfileDto } from './dto/update-mentor-profile.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { FindAllUsersDto } from '../users/dto/create-user.dto';

@Controller('mentor-profiles')
@ApiBearerAuth('token')
@UseGuards(TokenGuard, RoleGuard)
export class MentorProfilesController {
  constructor(private readonly mentorProfilesService: MentorProfilesService) {}

  @Post()
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT)
  @ApiOperation({ summary: 'Mentor yoki Assistant profil yaratishi mumkin' })
  async create(@Req() req: any, @Body() dto: CreateMentorProfileDto) {
    const userId = req.user.id;
    return this.mentorProfilesService.create(userId, dto);
  }

  @UseGuards(TokenGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@Query() query: FindAllUsersDto) {
    const showDeleted = query.isDeleted === 'true';
    return this.mentorProfilesService.findAll(showDeleted);
  }

  @UseGuards(TokenGuard, RoleGuard)
  @ApiOperation({
    summary: `${UserRole.MENTOR} va ${UserRole.ASSISTANT} o'z profilini ko'radi`,
  })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT)
  @Get('some')
  getSomeProfile(@Req() req: any) {
    return this.mentorProfilesService.findOneByUserId(req?.user?.id);
  }

  @UseGuards(TokenGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Get(':id')
  findOneProfile(@Param('id', ParseIntPipe) id: number) {
    return this.mentorProfilesService.findOneByUserId(id);
  }

  @UseGuards(TokenGuard, RoleGuard)
  @ApiOperation({
    summary: `${UserRole.MENTOR} va ${UserRole.ASSISTANT} o'z profilini O'zgartiradi`,
  })
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT)
  @Patch('profile/update')
  updateMyMentorProfile(
    @Req() req: any,
    @Body() updateMentorProfileDto: UpdateMentorProfileDto,
  ) {
    return this.mentorProfilesService.update(
      req['user'].id,
      updateMentorProfileDto,
    );
  }

  @UseGuards(TokenGuard, RoleGuard)
  @ApiOperation({
    summary: `${UserRole.ADMIN} mentor profilini O'zgartiradi`,
  })
  @Roles(UserRole.ADMIN)
  @Patch('profile/update/:id')
  updateMentorProfileByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMentorProfileDto: UpdateMentorProfileDto,
  ) {
    return this.mentorProfilesService.update(id, updateMentorProfileDto);
  }

  @UseGuards(TokenGuard, RoleGuard)
  @Roles(UserRole.MENTOR, UserRole.ASSISTANT)
  @Delete('me/delete')
  @ApiOperation({ summary: `Mentor o'z mentor profileni o'chirishi` })
  async deleteMe(@Req() req: Request) {
    const user = req['user'];
    return this.mentorProfilesService.softDelete(user.id);
  }

  @UseGuards(TokenGuard, RoleGuard)
  @Delete(':id')
  @ApiOperation({
    summary: `${UserRole.MENTOR}ni ${UserRole.ADMIN}  o'chirishi`,
  })
  @Roles(UserRole.ADMIN)
  async deleteByAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.mentorProfilesService.softDelete(id);
  }
}
