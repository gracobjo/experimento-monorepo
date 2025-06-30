import { create } from 'xmlbuilder2';

export function generateFacturaeXML(invoice: any) {
  // Validaciones defensivas y valores por defecto
  const numeroFactura = invoice.numeroFactura || '';
  const fechaFactura = invoice.fechaFactura instanceof Date && !isNaN(invoice.fechaFactura) ? invoice.fechaFactura : new Date();
  const tipoFactura = invoice.tipoFactura || '';
  const emisor = invoice.emisor || {};
  const receptor = invoice.receptor || {};
  const importeTotal = typeof invoice.importeTotal === 'number' ? invoice.importeTotal : 0;
  const baseImponible = typeof invoice.baseImponible === 'number' ? invoice.baseImponible : 0;
  const cuotaIVA = typeof invoice.cuotaIVA === 'number' ? invoice.cuotaIVA : 0;
  const tipoIVA = typeof invoice.tipoIVA === 'number' ? invoice.tipoIVA : 0;
  const items = Array.isArray(invoice.items) ? invoice.items.filter(Boolean) : [];

  // Construir el array plano para xmlbuilder2
  const itemsArray = items.length > 0
    ? items
        .filter(item => item && typeof item === 'object' && !Array.isArray(item))
        .map((item: any) => ({
          Description: String(item.description || ''),
          Quantity: typeof item.quantity === 'number' ? item.quantity : 0,
          UnitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 0,
          Total: typeof item.total === 'number' ? item.total : 0,
        }))
    : [{ Description: '', Quantity: 0, UnitPrice: 0, Total: 0 }];

  console.log('Items que se procesarán:', JSON.stringify(itemsArray, null, 2));

  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('Factura', { xmlns: 'http://www.facturae.es/Facturae/2009/v3.2/Facturae' })
      .ele('Cabecera')
        .ele('NumeroFactura').txt(numeroFactura).up()
        .ele('FechaFactura').txt(fechaFactura.toISOString().slice(0, 10)).up()
        .ele('TipoFactura').txt(tipoFactura).up()
      .up()
      .ele('Emisor')
        .ele('NIF').txt(emisor.dni || emisor.email || '').up()
        .ele('Nombre').txt(emisor.name || '').up()
      .up()
      .ele('Receptor')
        .ele('NIF').txt(receptor.dni || receptor.email || '').up()
        .ele('Nombre').txt(receptor.name || '').up()
      .up()
      .ele('DatosFactura')
        .ele('ImporteTotal').txt(importeTotal.toFixed(2)).up()
        .ele('IVA')
          .ele('Tipo').txt(tipoIVA.toString()).up()
          .ele('BaseImponible').txt(baseImponible.toFixed(2)).up()
          .ele('Cuota').txt(cuotaIVA.toFixed(2)).up()
        .up()
      .up()
      .ele('Items');

  // Agregar cada item individualmente
  for (const item of itemsArray) {
    root.ele('Item')
      .ele('Description').txt(item.Description).up()
      .ele('Quantity').txt(item.Quantity.toString()).up()
      .ele('UnitPrice').txt(item.UnitPrice.toString()).up()
      .ele('Total').txt(item.Total.toString()).up()
      .up();
  }

  return root.up().up().end({ prettyPrint: true });
} 