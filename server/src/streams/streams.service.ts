import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { ProcessRegistry } from '../health/process-registry';
import { VideosService } from '../videos/videos.service';

export interface StreamSession {
  id: string;
  status: 'live' | 'ended';
  segmentDuration: number;
  hlsManifestPath: string;
  startedAt: string;
  endedAt: string | null;
  qualities: string[];
}

const HLS_OUTPUT_DIR = process.env.HLS_OUTPUT_DIR || '/data/hls';
const SEGMENT_DURATION = process.env.HLS_SEGMENT_DURATION || '4';

const QUALITY_PRESETS = [
  { name: '480p', scale: '854:480', bitrate: '800k', maxrate: '856k', bufsize: '1200k' },
  { name: '720p', scale: '1280:720', bitrate: '2800k', maxrate: '2996k', bufsize: '4200k' },
  { name: '1080p', scale: '1920:1080', bitrate: '5000k', maxrate: '5350k', bufsize: '7500k' },
];

@Injectable()
export class StreamsService {
  private streams = new Map<string, StreamSession>();
  private ffmpegProcesses = new Map<string, ChildProcess>();

  constructor(
    @Inject(forwardRef(() => VideosService))
    private readonly videosService: VideosService,
  ) {}

  create(segmentDuration = parseInt(SEGMENT_DURATION, 10)): StreamSession {
    const id = randomUUID();
    const session: StreamSession = {
      id,
      status: 'live',
      segmentDuration,
      hlsManifestPath: `/hls/live/${id}/master.m3u8`,
      startedAt: new Date().toISOString(),
      endedAt: null,
      qualities: ['480p', '720p', '1080p'],
    };
    this.streams.set(id, session);
    return session;
  }

  startLiveStream(): StreamSession {
    const session = this.create();
    const outputBase = path.join(HLS_OUTPUT_DIR, 'live', session.id);

    for (const preset of QUALITY_PRESETS) {
      fs.mkdirSync(path.join(outputBase, preset.name), { recursive: true });
    }

    const args = [
      '-use_wallclock_as_timestamps', '1',
      '-fflags', '+genpts',
      '-f', 'webm', '-i', 'pipe:0',
    ];

    for (let i = 0; i < QUALITY_PRESETS.length; i++) {
      const p = QUALITY_PRESETS[i];
      const outDir = path.join(outputBase, p.name);
      args.push(
        '-map', '0:v', '-map', '0:a',
        `-c:v:${i}`, 'libx264', '-preset', 'ultrafast', '-tune', 'zerolatency',
        `-b:v:${i}`, p.bitrate, `-maxrate:v:${i}`, p.maxrate, `-bufsize:v:${i}`, p.bufsize,
        `-filter:v:${i}`, `fps=30,scale=${p.scale}`,
        `-c:a:${i}`, 'aac', '-b:a', '128k',
        '-f', 'hls',
        '-hls_time', String(session.segmentDuration),
        '-hls_playlist_type', 'event',
        '-hls_segment_filename', path.join(outDir, 'segment-%03d.ts'),
        path.join(outDir, 'stream.m3u8'),
      );
    }

    const child = spawn('ffmpeg', args);
    ProcessRegistry.register(child, 'ffmpeg-live', session.id);
    this.ffmpegProcesses.set(session.id, child);

    child.stderr.on('data', (data: Buffer) => {
      // Log FFmpeg output for debugging
      const line = data.toString().trim();
      if (line) {
        console.log(JSON.stringify({
          service: 'streaming-101-server',
          timestamp: new Date().toISOString(),
          level: 'debug',
          message: `[ffmpeg-live:${session.id}] ${line.slice(0, 200)}`,
        }));
      }
    });

    child.on('close', () => {
      this.ffmpegProcesses.delete(session.id);
    });

    this.writeMasterManifest(outputBase);

    return session;
  }

  feedData(streamId: string, data: Buffer) {
    const proc = this.ffmpegProcesses.get(streamId);
    if (proc?.stdin?.writable) {
      proc.stdin.write(data);
    }
  }

  async stopLiveStream(streamId: string): Promise<void> {
    const session = this.streams.get(streamId);
    if (!session || session.status === 'ended') return;

    session.status = 'ended';
    session.endedAt = new Date().toISOString();

    const proc = this.ffmpegProcesses.get(streamId);
    if (proc) {
      if (proc.stdin && !proc.stdin.destroyed) proc.stdin.end();
      await new Promise<void>((resolve) => {
        if (proc.exitCode !== null) return resolve();
        proc.once('close', () => resolve());
      });
    }

    const liveDir = path.join(HLS_OUTPUT_DIR, 'live', streamId);
    const vodDir = path.join(HLS_OUTPUT_DIR, 'vod', streamId);
    if (fs.existsSync(liveDir) && !fs.existsSync(vodDir)) {
      try {
        fs.renameSync(liveDir, vodDir);
        const title = `Live recording — ${new Date(session.startedAt).toLocaleString()}`;
        this.videosService.registerArchivedLive(streamId, title);
      } catch (err) {
        console.log(JSON.stringify({
          service: 'streaming-101-server',
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Failed to archive live stream ${streamId}: ${err}`,
        }));
      }
    }
  }

  findAll(): StreamSession[] {
    return [...this.streams.values()];
  }

  findById(id: string): StreamSession | undefined {
    return this.streams.get(id);
  }

  findActive(): StreamSession | undefined {
    return [...this.streams.values()].find(s => s.status === 'live');
  }

  updateConfig(id: string, updates: Partial<Pick<StreamSession, 'segmentDuration'>>) {
    const session = this.streams.get(id);
    if (!session) return undefined;

    if (updates.segmentDuration !== undefined) {
      session.segmentDuration = updates.segmentDuration;
      // Restart FFmpeg with new segment duration would require killing and respawning.
      // For the demo, we update the session config — the change applies at next stream start.
    }

    return session;
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
