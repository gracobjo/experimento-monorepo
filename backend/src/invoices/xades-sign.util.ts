import * as xadesjs from "xadesjs";
import { Crypto } from "@peculiar/webcrypto";
import { DOMParser, XMLSerializer } from "xmldom";

// Necesario para Node.js: establecer el motor de crypto global
const webcrypto = new Crypto();
xadesjs.Application.setEngine("OpenSSL", webcrypto);

function pemToArrayBuffer(pem: string): ArrayBuffer {
  // Elimina encabezados y pies de línea
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const binary = Buffer.from(b64, 'base64');
  return binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength);
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const keyBuffer = pemToArrayBuffer(pem);
  return await webcrypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    },
    false,
    ['sign']
  );
}

export async function signFacturaeXML(xml: string, certPem: string, keyPem: string): Promise<string> {
  // Parsear el XML
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "application/xml");

  // Importar la clave privada
  const privateKey = await importPrivateKey(keyPem);

  // Certificado como base64 (sin encabezados)
  const certBase64 = certPem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');

  // Crear la firma
  const signedXml = new xadesjs.SignedXml();

  // Firmar el XML
  await signedXml.Sign(
    { name: "RSASSA-PKCS1-v1_5" },
    privateKey,
    xmlDoc.documentElement
  );

  // Agregar el certificado manualmente al KeyInfo
  const signatureNode = signedXml.GetXml();
  const keyInfo = signatureNode.getElementsByTagName("KeyInfo")[0];
  if (keyInfo) {
    const x509Data = xmlDoc.createElementNS("http://www.w3.org/2000/09/xmldsig#", "ds:X509Data");
    const x509Cert = xmlDoc.createElementNS("http://www.w3.org/2000/09/xmldsig#", "ds:X509Certificate");
    x509Cert.textContent = certBase64;
    x509Data.appendChild(x509Cert);
    keyInfo.appendChild(x509Data);
  }

  // Serializar el XML firmado
  // El XML firmado está en signedXml.GetXml(), pero si quieres el documento completo con la firma incrustada:
  // Inserta la firma en el documento original
  xmlDoc.documentElement.appendChild(xmlDoc.importNode(signatureNode, true));
  return new XMLSerializer().serializeToString(xmlDoc);
} 