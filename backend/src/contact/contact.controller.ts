import { Controller, Post, Body, HttpStatus, HttpException } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async submitContactForm(@Body() createContactDto: CreateContactDto) {
    try {
      const result = await this.contactService.submitContactForm(createContactDto);
      return {
        success: true,
        message: 'Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.',
        data: result
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 