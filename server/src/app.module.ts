import { Module } from '@nestjs/common';
import { HlsModule } from './hls/hls.module';
import { HealthController } from './health/health.controller';
import { VideosModule } from './videos/videos.module';
import { StreamsModule } from './streams/streams.module';
import { WsModule } from './ws/ws.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    HlsModule,
    VideosModule,
    StreamsModule,
    WsModule,
    StatsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
