import { Module, forwardRef } from '@nestjs/common';
import { StreamsController } from './streams.controller';
import { StreamsService } from './streams.service';
import { VideosModule } from '../videos/videos.module';

@Module({
  imports: [forwardRef(() => VideosModule)],
  controllers: [StreamsController],
  providers: [StreamsService],
  exports: [StreamsService],
})
export class StreamsModule {}
