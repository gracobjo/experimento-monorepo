import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TeleassistanceService } from './teleassistance.service';
import { CreateTeleassistanceSessionDto } from './dto/create-teleassistance-session.dto';
import { UpdateTeleassistanceSessionDto } from './dto/update-teleassistance-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Teleasistencia')
@Controller('teleassistance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TeleassistanceController {
  constructor(private readonly teleassistanceService: TeleassistanceService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Crear una nueva sesión de teleasistencia' })
  @ApiResponse({
    status: 201,
    description: 'Sesión de teleasistencia creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario o asistente no encontrado' })
  async createSession(
    @Body() createDto: CreateTeleassistanceSessionDto,
    @Request() req,
  ) {
    return this.teleassistanceService.createSession(createDto);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Obtener una sesión de teleasistencia por ID' })
  @ApiParam({ name: 'id', description: 'ID de la sesión' })
  @ApiResponse({
    status: 200,
    description: 'Sesión de teleasistencia encontrada',
  })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada' })
  async getSessionById(@Param('id') id: string) {
    return this.teleassistanceService.getSessionById(id);
  }

  @Get('sessions/user/:userId')
  @ApiOperation({ summary: 'Obtener sesiones de teleasistencia de un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Sesiones del usuario encontradas',
  })
  async getSessionsByUser(@Param('userId') userId: string) {
    return this.teleassistanceService.getSessionsByUser(userId);
  }

  @Get('sessions/assistant/:assistantId')
  @ApiOperation({ summary: 'Obtener sesiones de teleasistencia de un asistente' })
  @ApiParam({ name: 'assistantId', description: 'ID del asistente' })
  @ApiResponse({
    status: 200,
    description: 'Sesiones del asistente encontradas',
  })
  @Roles('ADMIN', 'ABOGADO')
  async getSessionsByAssistant(@Param('assistantId') assistantId: string) {
    return this.teleassistanceService.getSessionsByAssistant(assistantId);
  }

  @Get('sessions/pending')
  @ApiOperation({ summary: 'Obtener sesiones pendientes de teleasistencia' })
  @ApiResponse({
    status: 200,
    description: 'Sesiones pendientes encontradas',
  })
  @Roles('ADMIN', 'ABOGADO')
  async getPendingSessions() {
    return this.teleassistanceService.getPendingSessions();
  }

  @Put('sessions/:id')
  @ApiOperation({ summary: 'Actualizar una sesión de teleasistencia' })
  @ApiParam({ name: 'id', description: 'ID de la sesión' })
  @ApiResponse({
    status: 200,
    description: 'Sesión actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada' })
  async updateSession(
    @Param('id') id: string,
    @Body() updateDto: UpdateTeleassistanceSessionDto,
  ) {
    return this.teleassistanceService.updateSession(id, updateDto);
  }

  @Post('sessions/:id/start')
  @ApiOperation({ summary: 'Iniciar una sesión de teleasistencia' })
  @ApiParam({ name: 'id', description: 'ID de la sesión' })
  @ApiResponse({
    status: 200,
    description: 'Sesión iniciada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada' })
  @ApiResponse({ status: 400, description: 'La sesión no está pendiente' })
  @Roles('ADMIN', 'ABOGADO')
  async startSession(@Param('id') id: string) {
    return this.teleassistanceService.startSession(id);
  }

  @Post('sessions/:id/end')
  @ApiOperation({ summary: 'Finalizar una sesión de teleasistencia' })
  @ApiParam({ name: 'id', description: 'ID de la sesión' })
  @ApiResponse({
    status: 200,
    description: 'Sesión finalizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada' })
  @ApiResponse({ status: 400, description: 'La sesión ya está completada' })
  @Roles('ADMIN', 'ABOGADO')
  async endSession(
    @Param('id') id: string,
    @Body() body: { resolution?: string },
  ) {
    return this.teleassistanceService.endSession(id, body.resolution);
  }

  @Post('sessions/:id/messages')
  @ApiOperation({ summary: 'Agregar un mensaje a una sesión de teleasistencia' })
  @ApiParam({ name: 'id', description: 'ID de la sesión' })
  @ApiResponse({
    status: 201,
    description: 'Mensaje agregado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada' })
  async addMessage(
    @Param('id') sessionId: string,
    @Body() body: { content: string; messageType?: 'TEXT' | 'INSTRUCTION' | 'SYSTEM' },
    @Request() req,
  ) {
    return this.teleassistanceService.addMessage(
      sessionId,
      req.user.id,
      body.content,
      body.messageType || 'TEXT',
    );
  }

  @Get('sessions/:id/messages')
  @ApiOperation({ summary: 'Obtener mensajes de una sesión de teleasistencia' })
  @ApiParam({ name: 'id', description: 'ID de la sesión' })
  @ApiResponse({
    status: 200,
    description: 'Mensajes de la sesión encontrados',
  })
  async getSessionMessages(@Param('id') sessionId: string) {
    return this.teleassistanceService.getSessionMessages(sessionId);
  }

  @Get('remote-tools')
  @ApiOperation({ summary: 'Obtener herramientas de control remoto disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Herramientas de control remoto encontradas',
  })
  async getRemoteTools() {
    return this.teleassistanceService.getRemoteTools();
  }

  @Get('common-issues')
  @ApiOperation({ summary: 'Obtener problemas comunes y sus soluciones' })
  @ApiResponse({
    status: 200,
    description: 'Problemas comunes encontrados',
  })
  async getCommonIssues() {
    return this.teleassistanceService.getCommonIssues();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de teleasistencia' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de teleasistencia',
  })
  @Roles('ADMIN')
  async getSessionStats() {
    return this.teleassistanceService.getSessionStats();
  }

  @Get('my-sessions')
  @ApiOperation({ summary: 'Obtener sesiones del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Sesiones del usuario encontradas',
  })
  async getMySessions(@Request() req) {
    const user = req.user;
    if (['ADMIN', 'ABOGADO'].includes(user.role)) {
      return this.teleassistanceService.getSessionsByAssistant(user.id);
    } else {
      return this.teleassistanceService.getSessionsByUser(user.id);
    }
  }

  @Get('available-assistants')
  @ApiOperation({ summary: 'Obtener asistentes disponibles para teleasistencia' })
  @ApiResponse({
    status: 200,
    description: 'Asistentes disponibles encontrados',
  })
  async getAvailableAssistants() {
    // Este método debería obtener usuarios con rol ADMIN o ABOGADO
    // que estén disponibles para teleasistencia
    return this.teleassistanceService.getAvailableAssistants();
  }
} 