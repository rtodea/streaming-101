import { Request, Response, NextFunction } from 'express';

let correlationCounter = 0;

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const correlationId = `req-${++correlationCounter}`;
  const start = Date.now();

  res.on('finish', () => {
    console.log(JSON.stringify({
      service: 'streaming-101-server',
      timestamp: new Date().toISOString(),
      correlationId,
      level: 'info',
      message: `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`,
    }));
  });

  next();
}
