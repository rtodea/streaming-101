import {
  Controller, Get, Post, Delete, Param, Query,
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

  @Get(':id/bytes')
  getBytes(
    @Param('id') id: string,
    @Query('file') file: string = 'original',
    @Query('offset') offset: string = '0',
    @Query('length') length: string = '512',
  ) {
    const video = this.videosService.findById(id);
    if (!video) throw new NotFoundException('Video not found');

    const vodDir = path.join(HLS_OUTPUT_DIR, 'vod', id);
    let filePath: string;
    let label: string;

    if (file === 'original') {
      filePath = video.originalPath;
      label = `Original upload (${video.format})`;
    } else if (file === 'manifest') {
      filePath = path.join(vodDir, 'master.m3u8');
      label = 'HLS Master Manifest';
    } else if (file.match(/^\d+p\/segment-\d+\.ts$/)) {
      filePath = path.join(vodDir, file);
      label = `HLS Segment (${file})`;
    } else if (file.match(/^\d+p\/stream\.m3u8$/)) {
      filePath = path.join(vodDir, file);
      label = `Variant Manifest (${file})`;
    } else {
      throw new BadRequestException('Invalid file path');
    }

    if (!filePath || !fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const off = Math.max(0, parseInt(offset, 10) || 0);
    const len = Math.min(2048, Math.max(1, parseInt(length, 10) || 512));
    const stat = fs.statSync(filePath);
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(Math.min(len, stat.size - off));
    fs.readSync(fd, buf, 0, buf.length, off);
    fs.closeSync(fd);

    const rows: { offset: string; hex: string; ascii: string }[] = [];
    for (let i = 0; i < buf.length; i += 16) {
      const slice = buf.subarray(i, Math.min(i + 16, buf.length));
      rows.push({
        offset: (off + i).toString(16).padStart(8, '0'),
        hex: [...slice].map(b => b.toString(16).padStart(2, '0')).join(' '),
        ascii: [...slice].map(b => (b >= 0x20 && b <= 0x7e) ? String.fromCharCode(b) : '.').join(''),
      });
    }

    return {
      videoId: id,
      file: label,
      filePath: file,
      fileSize: stat.size,
      offset: off,
      length: buf.length,
      rows,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const deleted = this.videosService.delete(id);
    if (!deleted) throw new NotFoundException('Video not found');
    this.wsService.broadcast({ type: 'video:deleted', videoId: id });
    return { id, deleted: true };
  }
}
