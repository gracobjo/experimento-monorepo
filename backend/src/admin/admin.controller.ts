import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard
  @Get('dashboard')
  @ApiOperation({ 
    summary: 'Dashboard administrativo',
    description: 'Obtiene estadísticas generales del sistema (solo ADMIN)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas del dashboard',
    schema: {
      type: 'object',
      properties: {
        usuarios: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            activos: { type: 'number' },
            nuevosEsteMes: { type: 'number' }
          }
        },
        casos: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            activos: { type: 'number' },
            cerrados: { type: 'number' }
          }
        },
        facturacion: {
          type: 'object',
          properties: {
            totalEsteMes: { type: 'number' },
            totalAno: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // User Management
  @Get('users')
  @ApiOperation({ 
    summary: 'Obtener todos los usuarios',
    description: 'Devuelve la lista de todos los usuarios del sistema'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('users/:id')
  @ApiOperation({ 
    summary: 'Obtener usuario por ID',
    description: 'Devuelve un usuario específico por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario encontrado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id')
  @ApiOperation({ 
    summary: 'Actualizar usuario',
    description: 'Actualiza la información de un usuario'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nombre del usuario' },
        email: { type: 'string', description: 'Email del usuario' },
        role: { type: 'string', description: 'Rol del usuario' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateUser(id, data);
  }

  @Delete('users/:id')
  @ApiOperation({ 
    summary: 'Eliminar usuario',
    description: 'Elimina un usuario del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Usuario eliminado exitosamente' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // Case Management
  @Get('cases')
  @ApiOperation({ 
    summary: 'Obtener todos los casos',
    description: 'Devuelve la lista de todos los casos del sistema'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de casos',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string' },
          clientId: { type: 'string' },
          lawyerId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  async getAllCases() {
    return this.adminService.getAllCases();
  }

  @Get('cases/:id')
  @ApiOperation({ 
    summary: 'Obtener caso por ID',
    description: 'Devuelve un caso específico por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID del caso', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Caso encontrado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string' },
        clientId: { type: 'string' },
        lawyerId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  async getCaseById(@Param('id') id: string) {
    return this.adminService.getCaseById(id);
  }

  @Put('cases/:id')
  @ApiOperation({ 
    summary: 'Actualizar caso',
    description: 'Actualiza la información de un caso'
  })
  @ApiParam({ name: 'id', description: 'ID del caso', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Título del caso' },
        description: { type: 'string', description: 'Descripción del caso' },
        status: { type: 'string', description: 'Estado del caso' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Caso actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  async updateCase(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateCase(id, data);
  }

  @Delete('cases/:id')
  @ApiOperation({ 
    summary: 'Eliminar caso',
    description: 'Elimina un caso del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID del caso', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Caso eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Caso eliminado exitosamente' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  async deleteCase(@Param('id') id: string) {
    return this.adminService.deleteCase(id);
  }

  // Appointment Management
  @Get('appointments')
  @ApiOperation({ 
    summary: 'Obtener todas las citas',
    description: 'Devuelve la lista de todas las citas del sistema'
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
          lawyerId: { type: 'string' },
          clientId: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  async getAllAppointments() {
    return this.adminService.getAllAppointments();
  }

  @Get('appointments/:id')
  @ApiOperation({ 
    summary: 'Obtener cita por ID',
    description: 'Devuelve una cita específica por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID de la cita', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cita encontrada',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        location: { type: 'string' },
        notes: { type: 'string' },
        lawyerId: { type: 'string' },
        clientId: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  async getAppointmentById(@Param('id') id: string) {
    return this.adminService.getAppointmentById(id);
  }

  @Put('appointments/:id')
  @ApiOperation({ 
    summary: 'Actualizar cita',
    description: 'Actualiza la información de una cita'
  })
  @ApiParam({ name: 'id', description: 'ID de la cita', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Fecha y hora de la cita' },
        location: { type: 'string', description: 'Ubicación de la cita' },
        notes: { type: 'string', description: 'Notas de la cita' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cita actualizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        location: { type: 'string' },
        notes: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  async updateAppointment(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateAppointment(id, data);
  }

  @Delete('appointments/:id')
  @ApiOperation({ 
    summary: 'Eliminar cita',
    description: 'Elimina una cita del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID de la cita', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cita eliminada exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Cita eliminada exitosamente' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  async deleteAppointment(@Param('id') id: string) {
    return this.adminService.deleteAppointment(id);
  }

  // Task Management
  @Get('tasks')
  @ApiOperation({ 
    summary: 'Obtener todas las tareas',
    description: 'Devuelve la lista de todas las tareas del sistema'
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
          status: { type: 'string' },
          priority: { type: 'string' },
          assignedTo: { type: 'string' },
          caseId: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  async getAllTasks() {
    return this.adminService.getAllTasks();
  }

  @Get('tasks/:id')
  @ApiOperation({ 
    summary: 'Obtener tarea por ID',
    description: 'Devuelve una tarea específica por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID de la tarea', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tarea encontrada',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string' },
        priority: { type: 'string' },
        assignedTo: { type: 'string' },
        caseId: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async getTaskById(@Param('id') id: string) {
    return this.adminService.getTaskById(id);
  }

  @Put('tasks/:id')
  @ApiOperation({ 
    summary: 'Actualizar tarea',
    description: 'Actualiza la información de una tarea'
  })
  @ApiParam({ name: 'id', description: 'ID de la tarea', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Título de la tarea' },
        description: { type: 'string', description: 'Descripción de la tarea' },
        status: { type: 'string', description: 'Estado de la tarea' },
        priority: { type: 'string', description: 'Prioridad de la tarea' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tarea actualizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string' },
        priority: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async updateTask(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateTask(id, data);
  }

  @Delete('tasks/:id')
  @ApiOperation({ 
    summary: 'Eliminar tarea',
    description: 'Elimina una tarea del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID de la tarea', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tarea eliminada exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Tarea eliminada exitosamente' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async deleteTask(@Param('id') id: string) {
    return this.adminService.deleteTask(id);
  }

  // Document Management
  @Get('documents')
  @ApiOperation({ 
    summary: 'Obtener todos los documentos',
    description: 'Devuelve la lista de todos los documentos del sistema'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de documentos',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          filename: { type: 'string' },
          originalName: { type: 'string' },
          mimeType: { type: 'string' },
          size: { type: 'number' },
          uploadedBy: { type: 'string' },
          caseId: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  async getAllDocuments() {
    return this.adminService.getAllDocuments();
  }

  @Get('documents/:id')
  @ApiOperation({ 
    summary: 'Obtener documento por ID',
    description: 'Devuelve un documento específico por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID del documento', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Documento encontrado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        filename: { type: 'string' },
        originalName: { type: 'string' },
        mimeType: { type: 'string' },
        size: { type: 'number' },
        uploadedBy: { type: 'string' },
        caseId: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  async getDocumentById(@Param('id') id: string) {
    return this.adminService.getDocumentById(id);
  }

  @Delete('documents/:id')
  @ApiOperation({ 
    summary: 'Eliminar documento',
    description: 'Elimina un documento del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID del documento', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Documento eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Documento eliminado exitosamente' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  async deleteDocument(@Param('id') id: string) {
    return this.adminService.deleteDocument(id);
  }

  // Reports
  @Get('reports')
  @ApiOperation({ 
    summary: 'Obtener reportes del sistema',
    description: 'Devuelve reportes y estadísticas generales del sistema'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Reportes del sistema',
    schema: {
      type: 'object',
      properties: {
        usuarios: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            porRol: {
              type: 'object',
              properties: {
                admin: { type: 'number' },
                abogado: { type: 'number' },
                cliente: { type: 'number' }
              }
            }
          }
        },
        casos: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            porEstado: {
              type: 'object',
              properties: {
                activo: { type: 'number' },
                cerrado: { type: 'number' },
                pendiente: { type: 'number' }
              }
            }
          }
        },
        facturacion: {
          type: 'object',
          properties: {
            totalAno: { type: 'number' },
            promedioMensual: { type: 'number' },
            facturasPendientes: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  async getSystemReports() {
    return this.adminService.getSystemReports();
  }
} 