import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { WebSocket } from 'ws';
import { WsService } from './ws.service';
import { StreamsService } from '../streams/streams.service';

@WebSocketGateway({ path: '/ws' })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private socketMeta = new WeakMap<WebSocket, { role: string; viewerId?: string; streamId?: string }>();

  constructor(
    private readonly wsService: WsService,
    private readonly streamsService: StreamsService,
  ) {}

  handleConnection(client: WebSocket) {
    client.on('message', (raw: Buffer | string) => {
      const meta = this.socketMeta.get(client);

      if (meta?.role === 'camera') {
        this.handleCameraBinary(raw as Buffer, meta.streamId!);
        return;
      }

      try {
        const msg = JSON.parse(raw.toString());
        this.routeMessage(client, msg);
      } catch {
        // ignore non-JSON on non-camera sockets
      }
    });
  }

  handleDisconnect(client: WebSocket) {
    const meta = this.socketMeta.get(client);
    if (!meta) return;

    if (meta.role === 'viewer' && meta.viewerId) {
      this.wsService.removeViewer(meta.viewerId);
    } else if (meta.role === 'presenter') {
      this.wsService.clearPresenter(client);
    } else if (meta.role === 'camera') {
      if (meta.streamId) {
        this.streamsService.stopLiveStream(meta.streamId);
        this.wsService.broadcast({ type: 'stream:ended', streamId: meta.streamId });
      }
      this.wsService.clearCameraSocket(client);
    }

    this.socketMeta.delete(client);
  }

  private routeMessage(client: WebSocket, msg: Record<string, unknown>) {
    switch (msg.type) {
      case 'viewer:connect':
        this.socketMeta.set(client, { role: 'viewer', viewerId: msg.viewerId as string });
        this.wsService.addViewer(msg.viewerId as string, msg.watchingId as string, client);
        break;

      case 'presenter:connect':
        this.socketMeta.set(client, { role: 'presenter' });
        this.wsService.setPresenter(client);
        break;

      case 'camera:start': {
        const session = this.streamsService.startLiveStream();
        this.socketMeta.set(client, { role: 'camera', streamId: session.id });
        this.wsService.setCameraSocket(client);
        this.wsService.broadcast({ type: 'stream:started', streamId: session.id });
        break;
      }

      case 'viewer:stats':
        this.wsService.updateViewerStats(
          msg.viewerId as string,
          msg as Record<string, unknown>,
        );
        break;

      case 'viewer:disconnect':
        this.wsService.removeViewer(msg.viewerId as string);
        break;

      case 'camera:stop': {
        const meta = this.socketMeta.get(client);
        if (meta?.streamId) {
          this.streamsService.stopLiveStream(meta.streamId);
          this.wsService.broadcast({ type: 'stream:ended', streamId: meta.streamId });
        }
        this.wsService.clearCameraSocket(client);
        break;
      }
    }
  }

  private handleCameraBinary(data: Buffer, streamId: string) {
    this.streamsService.feedData(streamId, data);
  }
}
