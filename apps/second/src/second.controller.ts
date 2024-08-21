import { Controller, Get } from '@nestjs/common';
import { SecondService } from './second.service';

@Controller()
export class SecondController {
  constructor(private readonly secondService: SecondService) {}

  @Get()
  getHello(): string {
    return this.secondService.getHello();
  }
}
