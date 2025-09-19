import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('api')
  getRoot() {
    return { message: 'Task Management API is running!' };
  }
}
