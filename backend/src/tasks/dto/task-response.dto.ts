import { TaskPriority, TaskStatus } from './create-task.dto';

export class TaskResponseDto {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  expedienteId?: string;
  clientId?: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  expediente?: {
    id: string;
    title: string;
    client: {
      user: {
        name: string;
        email: string;
      };
    };
  };
  client?: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  assignedToUser?: {
    id: string;
    name: string;
    email: string;
  };
  createdByUser: {
    id: string;
    name: string;
    email: string;
  };
} 