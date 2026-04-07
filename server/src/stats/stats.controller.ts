import { Controller, Get } from '@nestjs/common';
import { WsService } from '../ws/ws.service';

@Controller('api/stats')
export class StatsController {
  constructor(private readonly wsService: WsService) {}

  @Get()
  getStats() {
    return this.wsService.getAggregatedStats();
  }
}
