import { Module, forwardRef } from '@nestjs/common';
import { WsGateway } from './ws.gateway';
import { WsService } from './ws.service';
import { StreamsModule } from '../streams/streams.module';

@Module({
  imports: [forwardRef(() => StreamsModule)],
  providers: [WsGateway, WsService],
  exports: [WsService],
})
export class WsModule {}
