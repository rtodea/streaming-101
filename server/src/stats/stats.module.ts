import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { WsModule } from '../ws/ws.module';

@Module({
  imports: [WsModule],
  controllers: [StatsController],
})
export class StatsModule {}
