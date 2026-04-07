import { Controller, Get, Patch, Param, Body, NotFoundException } from '@nestjs/common';
import { StreamsService } from './streams.service';

@Controller('api/streams')
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) {}

  @Get()
  findAll() {
    return this.streamsService.findAll();
  }

  @Patch(':id/config')
  updateConfig(@Param('id') id: string, @Body() body: { segmentDuration?: number }) {
    const stream = this.streamsService.updateConfig(id, body);
    if (!stream) throw new NotFoundException('Stream not found');
    return stream;
  }
}
