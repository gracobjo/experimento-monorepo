import { Status } from '@prisma/client';

export class CaseResponseDto {
  id: string;
  title: string;
  description?: string;
  status: Status;
  clientId: string;
  lawyerId: string;
  createdAt: Date;
  updatedAt?: Date;
  
  client?: {
    id: string;
    dni: string;
    phone?: string;
    address?: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  
  lawyer?: {
    id: string;
    name: string;
    email: string;
  };
  
  documents?: {
    id: string;
    filename: string;
    fileUrl: string;
    uploadedAt: Date;
  }[];
} 