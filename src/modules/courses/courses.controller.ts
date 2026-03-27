import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Req,
  BadRequestException,
  UploadedFiles,
  Query,
  ParseIntPipe,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto, FindAllCourseDto } from './dto/create-course.dto';
import {
  UpdateCourseByAdminDto,
  UpdateCourseByAuthorDto,
} from './dto/update-course.dto';
import { ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PrismaService } from 'src/core/database/prisma.service';

@Controller('courses')
@ApiBearerAuth('token')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly cloudinary: CloudinaryService,
    private readonly prisma: PrismaService,
  ) { }
  @Post()
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @UseGuards(TokenGuard, RoleGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'introVideo', maxCount: 1 },
    ]),
  )
  async create(
    @Req() req: any,
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      introVideo?: Express.Multer.File[];
    },
  ) {
    const bannerFile = files?.banner?.[0];
    const videoFile = files?.introVideo?.[0];

    let bannerResult: any;
    let videoResult: any;

    try {
      if (bannerFile) {
        bannerResult = await this.cloudinary.uploadFile(
          bannerFile,
          'courses/banners',
        );
      }

      if (videoFile) {
        videoResult = await this.cloudinary.uploadFile(
          videoFile,
          'courses/videos',
        );
      }

      return await this.coursesService.create(req.user.id, createCourseDto, {
        bannerUrl: bannerResult?.url || null,
        bannerPublicId: bannerResult?.publicId || null,
        introVideo: videoResult?.url || null,
        videoPublicId: videoResult?.publicId || null,
      });
    } catch (error) {
      if (bannerResult?.publicId)
        await this.cloudinary.deleteFile(bannerResult.publicId, 'image');
      if (videoResult?.publicId)
        await this.cloudinary.deleteFile(videoResult.publicId, 'video');
      throw error;
    }
  }

  @ApiOperation({ summary: `Barcha sotuvdagi kurslar` })
  @Get()
  findAllPublished(@Query() query: FindAllCourseDto) {
    const showDeleted = query.isDeleted === 'true';
    return this.coursesService.findAll(showDeleted, true);
  }

  @ApiOperation({ summary: `${UserRole.ADMIN} uchun barcha kurslar` })
  @Roles(UserRole.ADMIN)
  @UseGuards(TokenGuard, RoleGuard)
  @Get('all')
  findAll(@Query() query: FindAllCourseDto) {
    const showDeleted = query.isDeleted === 'true';
    return this.coursesService.findAll(showDeleted);
  }

  @ApiOperation({ summary: `Mentorning o'ziga tegishli barcha kurslari` })
  @Roles(UserRole.MENTOR)
  @UseGuards(TokenGuard, RoleGuard)
  @Get('my')
  findMyCourses(@Req() req: any) {
    return this.coursesService.findMyCoursesAsMentor(req.user.id);
  }

  @ApiOperation({ summary: `Bitta kurs haqida ma'lumot` })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @ApiOperation({ summary: `${UserRole.ADMIN} tomonidan kursni yangilash` })
  @Roles(UserRole.ADMIN)
  @UseGuards(TokenGuard, RoleGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'introVideo', maxCount: 1 },
    ]),
  )
  @Patch('update/byadmin/:id')
  async updateCourseByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseByAdminDto,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      introVideo?: Express.Multer.File[];
    },
  ) {
    const bannerFile = files?.banner?.[0];
    const videoFile = files?.introVideo?.[0];

    const existCourse = await this.prisma.course.findUnique({
      where: { id },
    });
    if (!existCourse) {
      throw new NotFoundException('Course not found');
    }

    if (updateCourseDto.categoryId == 0 || !updateCourseDto.categoryId) {
      delete updateCourseDto.categoryId;
    } else {
      const category = await this.prisma.courseCategory.findUnique({
        where: { id: Number(updateCourseDto.categoryId) },
      });
      if (!category) throw new NotFoundException(`Kategoriya topilmadi`);
    }
    if (updateCourseDto.price === undefined || updateCourseDto.price === null) {
      delete updateCourseDto.price;
    }
    if (updateCourseDto.mentorId == 0 || !updateCourseDto.mentorId) {
      delete updateCourseDto.mentorId;
    } else {
      const mentor = await this.prisma.user.findUnique({
        where: { id: Number(updateCourseDto.mentorId) },
      });
      if (!mentor)
        throw new NotFoundException('Yangi tayinlanayotgan mentor topilmadi');
    }

    let bannerResult: any;
    let videoResult: any;
    try {
      if (bannerFile) {
        if (existCourse.bannerPublicId) {
          await this.cloudinary.deleteFile(existCourse.bannerPublicId);
        }
        bannerResult = await this.cloudinary.uploadFile(
          bannerFile,
          'courses/banners',
        );
      }

      if (videoFile) {
        if (existCourse.videoPublicId) {
          await this.cloudinary.deleteFile(existCourse.videoPublicId);
        }
        videoResult = await this.cloudinary.uploadFile(
          videoFile,
          'courses/videos',
        );
      }
    } catch (error) {
      if (bannerResult?.publicId)
        await this.cloudinary.deleteFile(bannerResult.publicId, 'image');
      if (videoResult?.publicId)
        await this.cloudinary.deleteFile(videoResult.publicId, 'video');
      throw error;
    }

    return this.coursesService.updateCourseByAdmin(id, updateCourseDto, {
      bannerUrl: bannerResult?.url || null,
      bannerPublicId: bannerResult?.publicId || null,
      introVideo: videoResult?.url || null,
      videoPublicId: videoResult?.publicId || null,
    });
  }

  // @ApiOperation({ summary: `${UserRole.MENTOR}` })
  // @Roles(UserRole.MENTOR)
  // @UseGuards(TokenGuard, RoleGuard)
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(
  //   FileFieldsInterceptor([
  //     { name: 'banner', maxCount: 1 },
  //     { name: 'introVideo', maxCount: 1 },
  //   ]),
  // )
  // @Patch('update/byauthor/:id')
  // async updateCourseByAuthor(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Req() req: any,
  //   @Body() updateCourseDto: UpdateCourseByAuthorDto,
  //   @UploadedFiles()
  //   files: {
  //     banner?: Express.Multer.File[];
  //     introVideo?: Express.Multer.File[];
  //   },
  // ) {
  //   const bannerFile = files?.banner?.[0];
  //   const videoFile = files?.introVideo?.[0];

  //   const existCourse = await this.prisma.course.findUnique({
  //     where: { id },
  //   });
  //   if (!existCourse) {
  //     throw new NotFoundException('Course not found');
  //   }
  //   if (existCourse.mentorId !== req.user.id) {
  //     throw new ForbiddenException(`You cann't upgrade this course`);
  //   }

  //   let bannerResult: any;
  //   let videoResult: any;
  //   try {
  //     if (bannerFile) {
  //       if (existCourse.bannerPublicId) {
  //         await this.cloudinary.deleteFile(existCourse.bannerPublicId, 'image');
  //       }
  //       bannerResult = await this.cloudinary.uploadFile(
  //         bannerFile,
  //         'courses/banners',
  //       );
  //     }

  //     if (videoFile) {
  //       if (existCourse.videoPublicId) {
  //         await this.cloudinary.deleteFile(existCourse.videoPublicId, 'video');
  //       }
  //       videoResult = await this.cloudinary.uploadFile(
  //         videoFile,
  //         'courses/videos',
  //       );
  //     }
  //     return this.coursesService.updateCourseByAuthor(
  //       req.user.id,
  //       id,
  //       updateCourseDto,
  //       {
  //         bannerUrl: bannerResult?.url || null,
  //         bannerPublicId: bannerResult?.publicId || null,
  //         introVideo: videoResult?.url || null,
  //         videoPublicId: videoResult?.publicId || null,
  //       },
  //     );
  //   } catch (error) {
  //     if (bannerResult?.publicId)
  //       await this.cloudinary.deleteFile(bannerResult.publicId, 'image');
  //     if (videoResult?.publicId)
  //       await this.cloudinary.deleteFile(videoResult.publicId, 'video');
  //     throw error;
  //   }
  // }

  @ApiOperation({ summary: `${UserRole.ADMIN} coursni o'chirishi` })
  @Roles(UserRole.ADMIN)
  @UseGuards(TokenGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }

  @ApiOperation({ summary: `${UserRole.ADMIN} coursni sotuvga chiqarishi` })
  @Roles(UserRole.ADMIN)
  @UseGuards(TokenGuard, RoleGuard)
  @Patch('published/:id')
  publishedUpdate(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.publishedUpdate(id);
  }
}
