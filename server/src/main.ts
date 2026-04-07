import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import { requestLogger } from './middleware/request-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useWebSocketAdapter(new WsAdapter(app));
  app.use(requestLogger);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(JSON.stringify({
    service: 'streaming-101-server',
    timestamp: new Date().toISOString(),
    level: 'info',
    message: `Server listening on port ${port}`,
  }));
}

bootstrap();
