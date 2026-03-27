import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignCourseDto {
  @ApiProperty({ example: 1, description: 'Kurs ID raqami' })
  @IsInt()
  @IsNotEmpty()
  courseId: number;
}
