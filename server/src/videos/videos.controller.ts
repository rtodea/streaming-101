import {
  Controller, Get, Post, Delete, Param,
  NotFoundException, BadRequestException,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { VideosService } from './videos.service';
import { WsService } from '../ws/ws.service';

const HLS_OUTPUT_DIR = process.env.HLS_OUTPUT_DIR || '/data/hls';
const MAX_UPLOAD_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE || '524288000', 10);
const ALLOWED_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime'];
const FORMAT_MAP: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

@Controller('api/videos')
export class VideosController {
  constructor(
    private readonly videosService: VideosService,
    private readonly wsService: WsService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination(_req, _file, cb) {
        const tmpDir = path.join(HLS_OUTPUT_DIR, 'uploads');
        fs.mkdirSync(tmpDir, { recursive: true });
        cb(null, tmpDir);
      },
      filename(_req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    }),
    limits: { fileSize: MAX_UPLOAD_SIZE },
    fileFilter(_req, file, cb) {
      if (!ALLOWED_FORMATS.includes(file.mimetype)) {
        cb(new BadRequestException('Unsupported format'), false);
        return;
      }
      cb(null, true);
    },
  }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');

    const format = FORMAT_MAP[file.mimetype] || 'mp4';
    const video = this.videosService.create(
      file.originalname,
      file.path,
      format,
      file.size,
    );

    try {
      this.videosService.startTranscoding(video.id);
    } catch (err) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('Failed to start transcoding');
    }

    return { id: video.id, title: video.title, status: 'transcoding' };
  }

  @Get()
  findAll() {
    return this.videosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const video = this.videosService.findById(id);
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const deleted = this.videosService.delete(id);
    if (!deleted) throw new NotFoundException('Video not found');
    this.wsService.broadcast({ type: 'video:deleted', videoId: id });
    return { id, deleted: true };
  }
}
