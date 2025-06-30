import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@UseGuards(JwtAuthGuard)
@Controller('lawyer/reports')
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Obtener reportes del abogado',
    description: 'Devuelve reportes y estadísticas del abogado autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Reportes del abogado',
    schema: {
      type: 'object',
      properties: {
        casos: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            activos: { type: 'number' },
            cerrados: { type: 'number' },
            nuevosEsteMes: { type: 'number' }
          }
        },
        clientes: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            activos: { type: 'number' },
            nuevosEsteMes: { type: 'number' }
          }
        },
        facturacion: {
          type: 'object',
          properties: {
            totalEsteMes: { type: 'number' },
            totalAno: { type: 'number' },
            facturasPendientes: { type: 'number' }
          }
        },
        tareas: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            pendientes: { type: 'number' },
            completadas: { type: 'number' },
            vencidas: { type: 'number' }
          }
        },
        citas: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            hoy: { type: 'number' },
            estaSemana: { type: 'number' },
            proximas: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getLawyerReports(@Request() req) {
    return this.reportsService.getLawyerReports(req.user.id);
  }
} 