import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CourseCategoryService } from './course-category.service';
import {
  CreateCourseCategoryDto,
  FindAllCategoryeDto,
} from './dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';

@ApiBearerAuth('token')
@Controller('course-category')
export class CourseCategoryController {
  constructor(private readonly courseCategoryService: CourseCategoryService) {}

  @UseGuards(TokenGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Post()
  create(@Body() createCourseCategoryDto: CreateCourseCategoryDto) {
    return this.courseCategoryService.create(createCourseCategoryDto);
  }

  @ApiOperation({ summary: `Open endpoint` })
  @Get()
  findAll(@Query() query: FindAllCategoryeDto) {
    const showDeleted = query.isDeleted === 'true';
    return this.courseCategoryService.findAll(showDeleted);
  }

  @ApiOperation({ summary: `Open endpoint` })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseCategoryService.findOne(id);
  }

  @UseGuards(TokenGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseCategoryDto: UpdateCourseCategoryDto,
  ) {
    return this.courseCategoryService.update(id, updateCourseCategoryDto);
  }

  @UseGuards(TokenGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseCategoryService.remove(id);
  }
}
