export class DocumentResponseDto {
  id: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  expedienteId: string;
  uploadedAt: Date;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
} 