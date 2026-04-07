import { Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { ProcessRegistry } from '../health/process-registry';
import { WsService } from '../ws/ws.service';

export interface Video {
  id: string;
  title: string;
  originalPath: string;
  format: string;
  fileSize: number;
  status: 'upload_pending' | 'transcoding' | 'ready' | 'error';
  qualities: string[];
  hlsManifestPath: string;
  createdAt: string;
  transcodingProgress: number;
  errorMessage: string | null;
}

const HLS_OUTPUT_DIR = process.env.HLS_OUTPUT_DIR || '/data/hls';
const SEGMENT_DURATION = process.env.HLS_SEGMENT_DURATION || '4';

const QUALITY_PRESETS = [
  { name: '480p', scale: '854:480', bitrate: '800k', maxrate: '856k', bufsize: '1200k' },
  { name: '720p', scale: '1280:720', bitrate: '2800k', maxrate: '2996k', bufsize: '4200k' },
  { name: '1080p', scale: '1920:1080', bitrate: '5000k', maxrate: '5350k', bufsize: '7500k' },
];

@Injectable()
export class VideosService implements OnModuleInit {
  private videos = new Map<string, Video>();

  constructor(private readonly wsService: WsService) {}

  onModuleInit() {
    this.rebuildFromFilesystem();
  }

  private rebuildFromFilesystem() {
    const vodDir = path.join(HLS_OUTPUT_DIR, 'vod');
    if (!fs.existsSync(vodDir)) return;

    for (const dir of fs.readdirSync(vodDir)) {
      const masterPath = path.join(vodDir, dir, 'master.m3u8');
      if (!fs.existsSync(masterPath)) continue;

      const qualities = fs.readdirSync(path.join(vodDir, dir))
        .filter(f => fs.statSync(path.join(vodDir, dir, f)).isDirectory());

      this.videos.set(dir, {
        id: dir,
        title: dir,
        originalPath: '',
        format: 'unknown',
        fileSize: 0,
        status: 'ready',
        qualities,
        hlsManifestPath: `/hls/vod/${dir}/master.m3u8`,
        createdAt: new Date().toISOString(),
        transcodingProgress: 100,
        errorMessage: null,
      });
    }
  }

  create(title: string, originalPath: string, format: string, fileSize: number): Video {
    const id = randomUUID();
    const video: Video = {
      id,
      title,
      originalPath,
      format,
      fileSize,
      status: 'upload_pending',
      qualities: [],
      hlsManifestPath: `/hls/vod/${id}/master.m3u8`,
      createdAt: new Date().toISOString(),
      transcodingProgress: 0,
      errorMessage: null,
    };
    this.videos.set(id, video);
    return video;
  }

  findAll(): Video[] {
    return [...this.videos.values()];
  }

  findById(id: string): Video | undefined {
    return this.videos.get(id);
  }

  update(id: string, updates: Partial<Video>) {
    const video = this.videos.get(id);
    if (!video) return;
    Object.assign(video, updates);
  }

  delete(id: string): boolean {
    const video = this.videos.get(id);
    if (!video) return false;

    // Kill active FFmpeg process if transcoding
    if (video.status === 'transcoding') {
      const processes = ProcessRegistry.list();
      for (const proc of processes) {
        if (proc.label.startsWith(id) && proc.status === 'running') {
          try { process.kill(proc.pid); } catch {}
        }
      }
    }

    // Remove entity from store
    this.videos.delete(id);

    // Remove HLS output directory
    const vodDir = path.join(HLS_OUTPUT_DIR, 'vod', id);
    if (fs.existsSync(vodDir)) {
      fs.rmSync(vodDir, { recursive: true, force: true });
    }

    // Remove original upload file
    if (video.originalPath && fs.existsSync(video.originalPath)) {
      fs.unlinkSync(video.originalPath);
    }

    console.log(JSON.stringify({
      service: 'streaming-101-server',
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Deleted video ${id} (was ${video.status}), files removed`,
    }));

    return true;
  }

  startTranscoding(videoId: string) {
    const video = this.videos.get(videoId);
    if (!video) return;

    this.update(videoId, { status: 'transcoding' });

    const outputBase = path.join(HLS_OUTPUT_DIR, 'vod', videoId);
    fs.mkdirSync(outputBase, { recursive: true });

    const totalQualities = QUALITY_PRESETS.length;
    let completedQualities = 0;

    const transcodeQuality = (preset: typeof QUALITY_PRESETS[0], index: number) => {
      const outDir = path.join(outputBase, preset.name);
      fs.mkdirSync(outDir, { recursive: true });

      const args = [
        '-i', video.originalPath,
        '-vf', `scale=${preset.scale}`,
        '-c:v', 'libx264', '-preset', 'fast',
        '-b:v', preset.bitrate, '-maxrate', preset.maxrate, '-bufsize', preset.bufsize,
        '-c:a', 'aac', '-b:a', '128k',
        '-hls_time', SEGMENT_DURATION,
        '-hls_list_size', '0',
        '-hls_segment_filename', path.join(outDir, 'segment-%03d.ts'),
        '-f', 'hls',
        path.join(outDir, 'stream.m3u8'),
        '-y',
      ];

      const child = spawn('ffmpeg', args);
      ProcessRegistry.register(child, 'ffmpeg-transcode', `${videoId}/${preset.name}`);

      let duration = 0;
      let currentTime = 0;

      child.stderr.on('data', (data: Buffer) => {
        const line = data.toString();
        const durationMatch = line.match(/Duration:\s*(\d+):(\d+):(\d+)/);
        if (durationMatch) {
          duration = parseInt(durationMatch[1]) * 3600
            + parseInt(durationMatch[2]) * 60
            + parseInt(durationMatch[3]);
        }
        const timeMatch = line.match(/time=(\d+):(\d+):(\d+)/);
        if (timeMatch && duration > 0) {
          currentTime = parseInt(timeMatch[1]) * 3600
            + parseInt(timeMatch[2]) * 60
            + parseInt(timeMatch[3]);
          const qualityProgress = Math.min(100, Math.round((currentTime / duration) * 100));
          const overallProgress = Math.round(
            ((completedQualities * 100 + qualityProgress) / totalQualities),
          );
          this.update(videoId, { transcodingProgress: overallProgress });
          this.wsService.sendToPresenter({
            type: 'transcode:progress',
            videoId,
            progress: overallProgress,
            currentQuality: preset.name,
          });
        }
      });

      child.on('close', (code) => {
        if (code !== 0) {
          this.update(videoId, {
            status: 'error',
            errorMessage: `FFmpeg exited with code ${code} on ${preset.name}`,
          });
          this.wsService.sendToPresenter({
            type: 'transcode:error',
            videoId,
            error: `FFmpeg exited with code ${code}`,
          });
          return;
        }

        completedQualities++;
        const qualities = QUALITY_PRESETS.slice(0, completedQualities).map(p => p.name);
        this.update(videoId, { qualities });

        if (completedQualities < totalQualities) {
          transcodeQuality(QUALITY_PRESETS[completedQualities], completedQualities);
        } else {
          this.writeMasterManifest(outputBase);
          this.update(videoId, {
            status: 'ready',
            transcodingProgress: 100,
            qualities: QUALITY_PRESETS.map(p => p.name),
          });
          this.wsService.sendToPresenter({
            type: 'transcode:complete',
            videoId,
          });
        }
      });
    };

    transcodeQuality(QUALITY_PRESETS[0], 0);
  }

  private writeMasterManifest(outputBase: string) {
    const lines = ['#EXTM3U'];
    for (const preset of QUALITY_PRESETS) {
      const bandwidth = parseInt(preset.bitrate) * 1000;
      const [w, h] = preset.scale.split(':');
      lines.push(
        `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${w}x${h}`,
        `${preset.name}/stream.m3u8`,
      );
    }
    fs.writeFileSync(path.join(outputBase, 'master.m3u8'), lines.join('\n') + '\n');
  }
}
