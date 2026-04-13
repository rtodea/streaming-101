import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

const SLIDES_DIR = process.env.SLIDES_DIR || join(__dirname, '..', '..', '..', 'slides', 'slidev', 'dist');

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: SLIDES_DIR,
      serveRoot: '/slides',
    }),
  ],
})
export class SlidesModule {}
