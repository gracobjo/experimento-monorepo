import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, TaskStatus } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('tasks')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Crear nueva tarea',
    description: 'Crea una nueva tarea en el sistema'
  })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Tarea creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        dueDate: { type: 'string', format: 'date-time' },
        priority: { type: 'string', enum: ['BAJA', 'MEDIA', 'ALTA'] },
        status: { type: 'string', enum: ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA'] },
        expedienteId: { type: 'string' },
        clientId: { type: 'string' },
        assignedTo: { type: 'string' },
        createdBy: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener todas las tareas',
    description: 'Devuelve la lista de tareas según el rol del usuario'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: TaskStatus,
    description: 'Filtrar por estado de la tarea'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de tareas',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          dueDate: { type: 'string', format: 'date-time' },
          priority: { type: 'string', enum: ['BAJA', 'MEDIA', 'ALTA'] },
          status: { type: 'string', enum: ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA'] },
          expedienteId: { type: 'string' },
          clientId: { type: 'string' },
          assignedTo: { type: 'string' },
          createdBy: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          expediente: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              client: {
                type: 'object',
                properties: {
                  user: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      email: { type: 'string' }
                    }
                  }
                }
              }
            }
          },
          assignedToUser: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findAll(@Request() req, @Query('status') status?: TaskStatus) {
    if (status) {
      return this.tasksService.getTasksByStatus(status, req.user.id, req.user.role);
    }
    return this.tasksService.findAll(req.user.id, req.user.role);
  }

  @Get('stats')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener estadísticas de tareas',
    description: 'Devuelve estadísticas de tareas según el rol del usuario'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas de tareas',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byStatus: {
          type: 'object',
          properties: {
            PENDIENTE: { type: 'number' },
            EN_PROGRESO: { type: 'number' },
            COMPLETADA: { type: 'number' },
            CANCELADA: { type: 'number' }
          }
        },
        byPriority: {
          type: 'object',
          properties: {
            BAJA: { type: 'number' },
            MEDIA: { type: 'number' },
            ALTA: { type: 'number' }
          }
        },
        overdue: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getStats(@Request() req) {
    return this.tasksService.getTasksStats(req.user.id, req.user.role);
  }

  @Get('upcoming')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener tareas próximas',
    description: 'Devuelve las tareas próximas a vencer'
  })
  @ApiQuery({ 
    name: 'days', 
    required: false, 
    type: 'string',
    description: 'Número de días para considerar próximas (por defecto 7)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tareas próximas',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          dueDate: { type: 'string', format: 'date-time' },
          priority: { type: 'string' },
          status: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getUpcomingTasks(@Request() req, @Query('days') days?: string) {
    const daysNumber = days ? parseInt(days) : 7;
    return this.tasksService.getUpcomingTasks(req.user.id, req.user.role, daysNumber);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener tarea por ID',
    description: 'Devuelve los detalles de una tarea específica'
  })
  @ApiParam({ name: 'id', description: 'ID de la tarea', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Detalles de la tarea',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        dueDate: { type: 'string', format: 'date-time' },
        priority: { type: 'string' },
        status: { type: 'string' },
        expedienteId: { type: 'string' },
        clientId: { type: 'string' },
        assignedTo: { type: 'string' },
        createdBy: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Actualizar tarea',
    description: 'Actualiza los datos de una tarea existente'
  })
  @ApiParam({ name: 'id', description: 'ID de la tarea', type: 'string' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Tarea actualizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        dueDate: { type: 'string', format: 'date-time' },
        priority: { type: 'string' },
        status: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req) {
    return this.tasksService.update(id, updateTaskDto, req.user.id, req.user.role);
  }

  @Patch(':id/status')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Actualizar estado de tarea',
    description: 'Actualiza solo el estado de una tarea'
  })
  @ApiParam({ name: 'id', description: 'ID de la tarea', type: 'string' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA'],
          example: 'COMPLETADA'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de tarea actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async updateStatus(@Param('id') id: string, @Body() body: { status: TaskStatus }, @Request() req) {
    return this.tasksService.updateStatus(id, body.status, req.user.id, req.user.role);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Eliminar tarea',
    description: 'Elimina una tarea del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID de la tarea', type: 'string' })
  @ApiResponse({ status: 200, description: 'Tarea eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.id, req.user.role);
  }
} 