import { Controller, Get, Post, Body, UseGuards, Request, Delete, Param, ForbiddenException, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@ApiTags('appointments')
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener todas las citas',
    description: 'Devuelve la lista de citas según el rol del usuario'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de citas',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          location: { type: 'string' },
          notes: { type: 'string' },
          clientId: { type: 'string' },
          lawyerId: { type: 'string' },
          client: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' }
                }
              }
            }
          },
          lawyer: {
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
  async findAll(@Request() req) {
    return this.appointmentsService.findAll(req.user);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Crear nueva cita',
    description: 'Crea una nueva cita entre abogado y cliente'
  })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Cita creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        location: { type: 'string' },
        notes: { type: 'string' },
        clientId: { type: 'string' },
        lawyerId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    return this.appointmentsService.create(createAppointmentDto, req.user);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Cancelar cita',
    description: 'Permite a un cliente cancelar su propia cita'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cita cancelada exitosamente'
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para cancelar esta cita' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.appointmentsService.delete(id, req.user);
  }

  @Put(':id/reschedule')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Reprogramar cita',
    description: 'Permite a un abogado reprogramar una cita existente'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        date: { 
          type: 'string', 
          format: 'date-time',
          description: 'Nueva fecha y hora de la cita'
        },
        location: { 
          type: 'string',
          description: 'Nueva ubicación de la cita (opcional)'
        },
        notes: { 
          type: 'string',
          description: 'Notas adicionales sobre el cambio (opcional)'
        }
      },
      required: ['date']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cita reprogramada exitosamente'
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para reprogramar esta cita' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  async reschedule(
    @Param('id') id: string, 
    @Body() rescheduleData: { date: string; location?: string; notes?: string },
    @Request() req
  ) {
    return this.appointmentsService.reschedule(id, rescheduleData, req.user);
  }
} 