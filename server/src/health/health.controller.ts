import { Controller, Get } from '@nestjs/common';
import { ProcessRegistry } from './process-registry';

@Controller('api/health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      processes: ProcessRegistry.list(),
    };
  }
}
