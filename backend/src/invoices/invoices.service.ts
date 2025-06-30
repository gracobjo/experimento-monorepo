import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { generateFacturaeXML } from './facturae-xml.util';
import { signFacturaeXML } from './xades-sign.util';
import * as fs from 'fs';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateInvoiceDto) {
    try {
      console.log('DATA RECIBIDA EN SERVICE:', JSON.stringify(data, null, 2));
      let { items, expedienteId, provisionIds = [], ...invoiceData } = data;
      console.log('items:', items);
      console.log('expedienteId:', expedienteId);
      console.log('provisionIds recibidos:', provisionIds);
      console.log('invoiceData:', invoiceData);

      // Validar que items sea un array válido
      if (!Array.isArray(items)) {
        throw new Error('Items debe ser un array válido');
      }

      // Si hay provisiones seleccionadas, las busco y agrego como líneas negativas
      if (provisionIds.length > 0) {
        console.log('Buscando provisiones con IDs:', provisionIds);
        const provisiones = await this.prisma.provisionFondos.findMany({
          where: { id: { in: provisionIds } },
        });
        console.log('Provisiones encontradas:', provisiones.length);
        console.log('Provisiones:', JSON.stringify(provisiones, null, 2));
        
        // NO agregamos las provisiones como conceptos negativos
        // Solo las asociaremos con la factura más adelante
        console.log('Provisiones encontradas para asociar:', provisiones.length);
      } else {
        console.log('No hay provisionIds para procesar');
      }

      // Generar numeroFactura si no viene en la petición
      let numeroFactura = invoiceData.numeroFactura;
      if (!numeroFactura) {
        const year = new Date().getFullYear();
        // Buscar el último número de factura de este año
        const lastInvoice = await this.prisma.invoice.findFirst({
          where: {
            numeroFactura: { startsWith: `fac-${year}-` },
          },
          orderBy: { createdAt: 'desc' },
        });
        let nextNumber = 1;
        if (lastInvoice && lastInvoice.numeroFactura) {
          const match = lastInvoice.numeroFactura.match(/fac-\d{4}-(\d{4})/);
          if (match) {
            nextNumber = parseInt(match[1], 10) + 1;
          }
        }
        numeroFactura = `fac-${year}-${nextNumber.toString().padStart(4, '0')}`;
      }

      // Construir el objeto data para Prisma, solo incluyendo expedienteId si existe
      const prismaData: any = {
        ...invoiceData,
        numeroFactura,
        fechaFactura: invoiceData.fechaFactura ? new Date(invoiceData.fechaFactura) : new Date(),
        fechaOperacion: new Date(invoiceData.fechaOperacion),
        items: { create: items },
        estado: 'emitida',
      };

      // Calcular totales automáticamente basándose en los items
      const baseImponible = items.reduce((sum: number, item: any) => {
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
        return sum + (quantity * unitPrice);
      }, 0);
      
      // Aplicar descuento si existe
      const descuento = typeof invoiceData.descuento === 'number' ? invoiceData.descuento : 0;
      const baseConDescuento = baseImponible * (1 - descuento / 100);
      
      // Calcular descuento por provisiones asociadas
      let descuentoProvisiones = 0;
      if (provisionIds.length > 0) {
        const provisiones = await this.prisma.provisionFondos.findMany({
          where: { id: { in: provisionIds } },
        });
        descuentoProvisiones = provisiones.reduce((sum, prov) => sum + prov.amount, 0);
      }
      
      // Aplicar IVA solo si se especifica
      const aplicarIVA = invoiceData.aplicarIVA !== false; // Por defecto true
      const tipoIVA = typeof invoiceData.tipoIVA === 'number' ? invoiceData.tipoIVA : 21;
      
      // Calcular base imponible después de descuentos (incluyendo provisiones)
      const baseConDescuentos = baseConDescuento - descuentoProvisiones;
      
      // Calcular IVA sobre la base con descuentos
      const cuotaIVA = aplicarIVA ? baseConDescuentos * (tipoIVA / 100) : 0;
      
      // Aplicar retención si existe
      const retencion = typeof invoiceData.retencion === 'number' ? invoiceData.retencion : 0;
      const cuotaRetencion = baseConDescuentos * (retencion / 100);
      
      // Calcular total final
      const importeTotal = baseConDescuentos + cuotaIVA - cuotaRetencion;

      // Actualizar los totales calculados
      prismaData.baseImponible = baseConDescuentos;
      prismaData.cuotaIVA = cuotaIVA;
      prismaData.importeTotal = importeTotal;
      prismaData.tipoIVA = tipoIVA;
      prismaData.descuento = descuento;
      prismaData.retencion = retencion;
      prismaData.aplicarIVA = aplicarIVA;

      if (expedienteId) {
        prismaData.expedienteId = expedienteId;
      }

      console.log('PRISMA DATA:', JSON.stringify(prismaData, null, 2));

      // Crear la factura y sus items
      console.log('Intentando crear factura en Prisma...');
      const invoice = await this.prisma.invoice.create({
        data: prismaData,
        include: { items: true, emisor: true, receptor: true, expediente: true },
      });
      console.log('Factura creada exitosamente:', invoice.id);

      // Asociar provisiones a la factura
      if (provisionIds.length > 0) {
        console.log('Asociando provisiones con invoiceId:', invoice.id);
        console.log('ProvisionIds a actualizar:', provisionIds);
        
        const updateResult = await this.prisma.provisionFondos.updateMany({
          where: { id: { in: provisionIds } },
          data: { invoiceId: invoice.id },
        });
        
        console.log('Resultado de actualización de provisiones:', updateResult);
        
        // Verificar que se actualizaron correctamente
        const provisionesActualizadas = await this.prisma.provisionFondos.findMany({
          where: { id: { in: provisionIds } },
        });
        console.log('Provisiones después de actualizar:', JSON.stringify(provisionesActualizadas, null, 2));
      } else {
        console.log('No hay provisionIds para asociar');
      }

      // Generar el XML Facturae
      console.log('Generando XML...');
      const xml = generateFacturaeXML(invoice);
      console.log('XML generado exitosamente');
      
      // Guardar el XML en la base de datos
      console.log('Guardando XML en BD...');
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { xml },
      });
      console.log('XML guardado exitosamente');
      
      // Devolver la factura con el XML
      return { ...invoice, xml };
    } catch (error: any) {
      console.error('Error completo en create:', error);
      if (error && typeof error === 'object' && 'stack' in error) {
        console.error('Stack trace:', error.stack);
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.invoice.findMany({ 
      include: { 
        items: true, 
        emisor: true, 
        receptor: true, 
        expediente: true,
        provisionFondos: true 
      } 
    });
  }

  async findOne(id: string) {
    return this.prisma.invoice.findUnique({ 
      where: { id }, 
      include: { 
        items: true, 
        emisor: true, 
        receptor: true, 
        expediente: true,
        provisionFondos: true 
      } 
    });
  }

  async update(id: string, data: UpdateInvoiceDto) {
    const { items, provisionIds, ...invoiceData } = data;
    
    // Obtener la factura actual para ver las provisiones asociadas
    const currentInvoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { provisionFondos: true }
    });
    
    if (!currentInvoice) {
      throw new Error('Factura no encontrada');
    }
    
    // Calcular totales automáticamente si hay items
    let updateData = { ...invoiceData };
    
    // Convertir fechaOperacion a Date si existe
    if (updateData.fechaOperacion) {
      updateData.fechaOperacion = new Date(updateData.fechaOperacion) as any;
    }
    
    if (items) {
      // Calcular base imponible
      const baseImponible = items.reduce((sum: number, item: any) => {
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
        return sum + (quantity * unitPrice);
      }, 0);
      
      // Aplicar descuento si existe
      const descuento = typeof invoiceData.descuento === 'number' ? invoiceData.descuento : 0;
      const baseConDescuento = baseImponible * (1 - descuento / 100);
      
      // Calcular descuento por provisiones asociadas
      let descuentoProvisiones = 0;
      if (currentInvoice.provisionFondos.length > 0) {
        descuentoProvisiones = currentInvoice.provisionFondos.reduce((sum, prov) => sum + prov.amount, 0);
      }
      
      // Aplicar IVA solo si se especifica
      const aplicarIVA = invoiceData.aplicarIVA !== false; // Por defecto true
      const tipoIVA = typeof invoiceData.tipoIVA === 'number' ? invoiceData.tipoIVA : 21;
      
      // Calcular base imponible después de descuentos (incluyendo provisiones)
      const baseConDescuentos = baseConDescuento - descuentoProvisiones;
      
      // Calcular IVA sobre la base con descuentos
      const cuotaIVA = aplicarIVA ? baseConDescuentos * (tipoIVA / 100) : 0;
      
      // Aplicar retención si existe
      const retencion = typeof invoiceData.retencion === 'number' ? invoiceData.retencion : 0;
      const cuotaRetencion = baseConDescuentos * (retencion / 100);
      
      // Calcular total final
      const importeTotal = baseConDescuentos + cuotaIVA - cuotaRetencion;
      
      // Actualizar los totales calculados
      updateData.baseImponible = baseConDescuentos;
      updateData.cuotaIVA = cuotaIVA;
      updateData.importeTotal = importeTotal;
      updateData.tipoIVA = tipoIVA;
      updateData.descuento = descuento;
      updateData.retencion = retencion;
      updateData.aplicarIVA = aplicarIVA;
    }
    
    // Si hay items, los actualizamos (borrado y recreación simplificada)
    if (items) {
      await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
    }
    
    return this.prisma.invoice.update({
      where: { id },
      data: {
        ...updateData,
        ...(items ? { items: { create: items } } : {}),
      },
      include: { 
        items: true, 
        emisor: true, 
        receptor: true, 
        expediente: true,
        provisionFondos: true 
      },
    });
  }

  async remove(id: string) {
    // Primero verificamos que la factura existe
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true }
    });
    
    if (!invoice) {
      throw new Error('Factura no encontrada');
    }

    // Usamos una transacción para asegurar que todo se elimine correctamente
    return await this.prisma.$transaction(async (prisma) => {
      // 1. Desvincular provisiones de fondos asociadas
      await prisma.provisionFondos.updateMany({
        where: { invoiceId: id },
        data: { invoiceId: null }
      });

      // 2. Eliminar los items de la factura
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id }
      });

      // 3. Eliminar la factura
      return await prisma.invoice.delete({
        where: { id },
        include: { items: true, emisor: true, receptor: true, expediente: true }
      });
    });
  }

  async sign(id: string, certPath?: string, keyPath?: string, certContent?: string, keyContent?: string) {
    // Obtener la factura y su XML
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice || !invoice.xml) {
      throw new Error('Factura o XML no encontrado');
    }
    // Obtener el contenido del certificado y la clave
    let cert = certContent;
    let key = keyContent;
    if (!cert && certPath) {
      cert = fs.readFileSync(certPath, 'utf8');
    }
    if (!key && keyPath) {
      key = fs.readFileSync(keyPath, 'utf8');
    }
    if (!cert || !key) {
      throw new Error('Certificado o clave no proporcionados');
    }
    // Firmar el XML
    const xmlFirmado = await signFacturaeXML(invoice.xml, cert, key);
    // Guardar el XML firmado
    await this.prisma.invoice.update({
      where: { id },
      data: { xmlFirmado },
    });
    return { ...invoice, xmlFirmado };
  }

  async generateXmlForInvoices(ids: string[], userId: string) {
    const result = [];
    for (const id of ids) {
      const invoice = await this.prisma.invoice.findUnique({ where: { id }, include: { emisor: true, items: true, receptor: true, expediente: true } });
      if (!invoice) throw new Error(`Factura ${id} no encontrada`);
      if (invoice.emisorId !== userId) throw new Error(`No autorizado para la factura ${id}`);
      // Generar XML si no existe
      let xml = invoice.xml;
      if (!xml) {
        xml = generateFacturaeXML(invoice);
        await this.prisma.invoice.update({ where: { id }, data: { xml } });
      }
      result.push({ id, xml });
    }
    return result;
  }

  async saveSignedXml(id: string, signedXml: string, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new Error('Factura no encontrada');
    if (invoice.emisorId !== userId) throw new Error('No autorizado para firmar esta factura');
    await this.prisma.invoice.update({ where: { id }, data: { xmlFirmado: signedXml } });
    return { id, status: 'signed' };
  }

  async annul(id: string, motivoAnulacion: string, userId: string) {
    // Solo el emisor puede anular
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new Error('Factura no encontrada');
    if (invoice.emisorId !== userId) throw new Error('No autorizado para anular esta factura');
    if (invoice.estado === 'anulada') throw new Error('La factura ya está anulada');
    return this.prisma.invoice.update({
      where: { id },
      data: {
        estado: 'anulada',
        motivoAnulacion,
      },
      include: { items: true, emisor: true, receptor: true, expediente: true },
    });
  }
} 