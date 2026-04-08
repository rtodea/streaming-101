import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';

interface ViewerConnection {
  ws: WebSocket;
  viewerId: string;
  watchingId: string;
  currentQuality: string | null;
  bandwidth: number;
  bufferLevel: number;
}

@Injectable()
export class WsService {
  private viewers = new Map<string, ViewerConnection>();
  private presenter: WebSocket | null = null;
  private cameraSocket: WebSocket | null = null;
  private statsThrottleTimer: ReturnType<typeof setTimeout> | null = null;
  private statsDirty = false;

  setPresenter(ws: WebSocket) {
    this.presenter = ws;
  }

  getPresenter(): WebSocket | null {
    return this.presenter;
  }

  setCameraSocket(ws: WebSocket) {
    this.cameraSocket = ws;
  }

  getCameraSocket(): WebSocket | null {
    return this.cameraSocket;
  }

  addViewer(viewerId: string, watchingId: string, ws: WebSocket) {
    this.viewers.set(viewerId, {
      ws, viewerId, watchingId,
      currentQuality: null, bandwidth: 0, bufferLevel: 0,
    });
    this.scheduleStatsBroadcast();
  }

  updateViewerStats(viewerId: string, stats: Record<string, unknown>) {
    const viewer = this.viewers.get(viewerId);
    if (!viewer) return;
    viewer.currentQuality = (stats.currentQuality as string) || viewer.currentQuality;
    viewer.bandwidth = (stats.bandwidth as number) || viewer.bandwidth;
    viewer.bufferLevel = (stats.bufferLevel as number) || viewer.bufferLevel;
    this.scheduleStatsBroadcast();
  }

  getAggregatedStats() {
    const viewers = [...this.viewers.values()];
    const viewerList = viewers.map(v => ({
      id: v.viewerId,
      connectedTo: v.watchingId,
      currentQuality: v.currentQuality,
      bandwidth: v.bandwidth,
      bufferLevel: v.bufferLevel,
    }));

    const totalBw = viewers.reduce((sum, v) => sum + v.bandwidth, 0);
    const avgBandwidth = viewers.length > 0 ? Math.round(totalBw / viewers.length) : 0;

    const qualityDistribution: Record<string, number> = {};
    for (const v of viewers) {
      if (v.currentQuality) {
        qualityDistribution[v.currentQuality] = (qualityDistribution[v.currentQuality] || 0) + 1;
      }
    }

    return {
      viewerCount: viewers.length,
      viewers: viewerList,
      avgBandwidth,
      qualityDistribution,
    };
  }

  private scheduleStatsBroadcast() {
    this.statsDirty = true;
    if (this.statsThrottleTimer) return;

    this.statsThrottleTimer = setTimeout(() => {
      this.statsThrottleTimer = null;
      if (this.statsDirty) {
        this.statsDirty = false;
        this.sendToPresenter({
          type: 'stats:update',
          ...this.getAggregatedStats(),
        });
      }
    }, 500);
  }

  removeViewer(viewerId: string) {
    this.viewers.delete(viewerId);
    this.scheduleStatsBroadcast();
  }

  getViewerCount(): number {
    return this.viewers.size;
  }

  getViewers(): ViewerConnection[] {
    return [...this.viewers.values()];
  }

  sendToPresenter(message: Record<string, unknown>) {
    if (this.presenter && this.presenter.readyState === WebSocket.OPEN) {
      this.presenter.send(JSON.stringify(message));
    }
  }

  broadcast(message: Record<string, unknown>) {
    const payload = JSON.stringify(message);
    for (const { ws } of this.viewers.values()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
    if (this.presenter && this.presenter.readyState === WebSocket.OPEN) {
      this.presenter.send(payload);
    }
  }

  clearPresenter(ws: WebSocket) {
    if (this.presenter === ws) this.presenter = null;
  }

  clearCameraSocket(ws: WebSocket) {
    if (this.cameraSocket === ws) this.cameraSocket = null;
  }
}
