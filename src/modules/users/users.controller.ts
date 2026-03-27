import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  UseInterceptors,
  Req,
  UploadedFile,
  DefaultValuePipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, FindAllUsersDto } from './dto/create-user.dto';
import { UpdateProfileDto, UpdateUserByAdminDto } from './dto/update-user.dto';
import { TokenGuard } from 'src/common/guards/token.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role';
import { UserRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
@Controller('users')
@ApiBearerAuth('token')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @UseGuards(TokenGuard, RoleGuard)
  @ApiOperation({ summary: `${UserRole.ADMIN}` })
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@Query() querry: FindAllUsersDto) {
    const showDeleted = querry.isDeleted === 'true';
    return this.usersService.findAll(showDeleted);
  }

  @UseGuards(TokenGuard)
  @ApiOperation({ summary: `User o'z ma'lumotlarini ko'rishi` })
  @Get("some")
  async findSome(@Req() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  @UseGuards(TokenGuard, RoleGuard)
  @ApiOperation({ summary: `User ma'lumotlarini ${UserRole.ADMIN} ko'rishi` })
  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }


  @UseGuards(TokenGuard)
  @ApiOperation({ summary: `User o'z ma'lumotlarini yangilashi` })
  @Patch('profile/update')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string' },
        password: { type: 'string' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async updateMyProfile(
    @Req() req: any,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl: any = undefined;
    let publicId: any = undefined;

    if (file) {
      const user = await this.usersService.findOne(req.user.id);
      if (user.publicId) {
        await this.cloudinary.deleteFile(user.publicId);
      }
      const uploadResult = await this.cloudinary.uploadFile(
        file,
        'users/profiles',
      );
      imageUrl = uploadResult.url;
      publicId = uploadResult.publicId;
    }

    return this.usersService.updateProfile(req['user']?.id, {
      ...dto,
      image: imageUrl,
      publicId: publicId,
    });
  }

  @Patch('admin/update/:id')
  @UseGuards(TokenGuard, RoleGuard)
  @ApiOperation({ summary: `User ma'lumotlarini ${UserRole.ADMIN} yangilashi` })
  @Roles(UserRole.ADMIN)
  async updateUserByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserByAdminDto,
  ) {
    return this.usersService.updateUserByAdmin(id, dto);
  }

  @UseGuards(TokenGuard)
  @Delete('me/delete')
  @ApiOperation({ summary: `User o'z ma'lumotlarini o'chirishi` })
  async deleteMe(@Req() req: Request) {
    const user = req['user'];
    return this.usersService.softDelete(user.id);
  }

  @UseGuards(TokenGuard,RoleGuard)
  @Delete(':id')
  @ApiOperation({ summary: `Userni ${UserRole.ADMIN}  o'chirishi` })
  @Roles(UserRole.ADMIN)
  async deleteByAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.softDelete(id);
  }
}
