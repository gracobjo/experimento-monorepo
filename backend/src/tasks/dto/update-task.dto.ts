import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto, TaskStatus } from './create-task.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
} 