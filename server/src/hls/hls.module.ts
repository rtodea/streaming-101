import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

const HLS_OUTPUT_DIR = process.env.HLS_OUTPUT_DIR || '/data/hls';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: HLS_OUTPUT_DIR,
      serveRoot: '/hls',
      serveStaticOptions: {
        setHeaders(res) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'no-cache');
        },
      },
    }),
  ],
})
export class HlsModule {}
