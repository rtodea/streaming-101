# Streaming 101 - Architecture Diagrams

## High-Level System Overview

```mermaid
graph TB
    subgraph Clients
        Creator[Creator UI<br/>NextJS]
        Viewer[Viewer UI<br/>NextJS]
        Mobile[Mobile Viewers<br/>QR Code Access]
    end

    subgraph k3s Cluster - tadeo.ro
        subgraph Frontend Pod
            NextJS[NextJS App<br/>Creator + Viewer Pages]
        end

        subgraph Backend Pod
            NestJS[NestJS API<br/>REST + WebSockets]
        end

        subgraph Transcoder Pod
            FFmpeg[FFmpeg Worker<br/>Live + VOD Transcoding]
        end

        subgraph Storage
            ObjectStore[(Video Storage<br/>Raw + Transcoded)]
            HLSChunks[(HLS Chunks<br/>.ts segments + .m3u8)]
        end
    end

    Creator --> NextJS
    Viewer --> NextJS
    Mobile --> NextJS
    NextJS --> NestJS
    NestJS --> FFmpeg
    FFmpeg --> ObjectStore
    FFmpeg --> HLSChunks
    NestJS --> HLSChunks
```

## VOD Pipeline (Upload & Transcode)

```mermaid
sequenceDiagram
    participant C as Creator
    participant API as NestJS API
    participant T as FFmpeg Transcoder
    participant S as Storage

    C->>API: Upload raw video
    API->>S: Store original file
    API->>T: Trigger transcoding job

    par Parallel Transcoding
        T->>T: Encode 1080p (high)
        T->>T: Encode 720p (medium)
        T->>T: Encode 480p (low)
    end

    T->>S: Store HLS chunks (.ts) per quality
    T->>S: Generate master manifest (.m3u8)
    T->>API: Job complete
    API->>C: Video ready for viewing
```

## Adaptive Bitrate Streaming (ABR) - Viewer Flow

```mermaid
sequenceDiagram
    participant V as Viewer (hls.js)
    participant API as NestJS API
    participant S as HLS Storage

    V->>API: Request video catalog
    API-->>V: Video list

    V->>S: Fetch master.m3u8
    S-->>V: Manifest with quality variants

    Note over V: Player selects initial quality<br/>(starts low for fast playback)

    loop Every 2-6 second chunk
        V->>V: Measure download speed
        alt High bandwidth
            V->>S: Request next chunk from 1080p stream
        else Medium bandwidth
            V->>S: Request next chunk from 720p stream
        else Low bandwidth
            V->>S: Request next chunk from 480p stream
        end
        S-->>V: .ts chunk
        V->>V: Append to playback buffer
    end
```

## Live Streaming Pipeline

```mermaid
graph LR
    subgraph Creator
        Camera[Digital Camera]
        OBS[OBS / WebRTC]
    end

    subgraph k3s Backend
        Ingest[RTMP Ingest<br/>NestJS]
        Trans[Live Transcoder<br/>FFmpeg]
        Chunk[HLS Chunker<br/>Segment Generator]
        WS[WebSocket Server<br/>Live Stats]
    end

    subgraph Viewers
        V1[Viewer 1]
        V2[Viewer 2]
        VN[Viewer N]
    end

    Camera -->|USB| OBS
    OBS -->|RTMP Stream| Ingest
    Ingest -->|Raw frames| Trans

    Trans -->|1080p| Chunk
    Trans -->|720p| Chunk
    Trans -->|480p| Chunk

    Chunk -->|HLS .m3u8 + .ts| V1
    Chunk -->|HLS .m3u8 + .ts| V2
    Chunk -->|HLS .m3u8 + .ts| VN

    V1 -.->|Stats| WS
    V2 -.->|Stats| WS
    VN -.->|Stats| WS
```

## HLS Chunk Segmentation & Latency

```mermaid
graph TD
    subgraph Incoming Live Stream
        Frame1[Frame 1..60]
        Frame2[Frame 61..120]
        Frame3[Frame 121..180]
    end

    subgraph "Segment Size = 6s (default)"
        Seg6a[Chunk 1 - 6s]
        Seg6b[Chunk 2 - 6s]
        Seg6c[Chunk 3 - 6s]
        Lat6["Latency: ~18s<br/>(3 chunks buffered)"]
    end

    subgraph "Segment Size = 2s (tuned)"
        Seg2a[Chunk 1 - 2s]
        Seg2b[Chunk 2 - 2s]
        Seg2c[Chunk 3 - 2s]
        Lat2["Latency: ~6s<br/>(3 chunks buffered)"]
    end

    subgraph "Segment Size = 1s (aggressive)"
        Seg1a[Chunk 1 - 1s]
        Seg1b[Chunk 2 - 1s]
        Seg1c[Chunk 3 - 1s]
        Lat1["Latency: ~3s<br/>(3 chunks buffered)"]
    end

    Frame1 --> Seg6a
    Frame2 --> Seg6b
    Frame3 --> Seg6c
    Seg6a --> Lat6

    Frame1 --> Seg2a
    Frame2 --> Seg2b
    Frame3 --> Seg2c
    Seg2a --> Lat2

    Frame1 --> Seg1a
    Frame2 --> Seg1b
    Frame3 --> Seg1c
    Seg1a --> Lat1

    style Lat6 fill:#f66,color:#fff
    style Lat2 fill:#fa0,color:#fff
    style Lat1 fill:#4a4,color:#fff
```

## Wow Factor - Live Audience Interaction

```mermaid
graph TB
    subgraph Presenter Screen
        Stats[Live Dashboard<br/>WebSocket-powered]
        Config[Server Config Panel<br/>Tweak HLS segments]
    end

    subgraph Audience Phones
        QR[Scan QR Code] --> Player
        Player[HLS Player + Stats Reporter]
    end

    subgraph k3s Backend
        WS[WebSocket Hub<br/>Socket.io]
        API[NestJS API]
    end

    Player -->|bandwidth, quality, latency| WS
    WS -->|aggregated stats| Stats
    Config -->|update segment size| API
    API -->|reconfigure FFmpeg| API

    WS -->|viewer count| Stats
    WS -->|avg bandwidth| Stats
    WS -->|quality distribution| Stats
```

## k3s Deployment Topology

```mermaid
graph TB
    subgraph "k3s Node - tadeo.ro / todea.eu"
        Ingress[Traefik Ingress]

        subgraph Pods
            FE[NextJS Pod<br/>replicas: 1]
            BE[NestJS Pod<br/>replicas: 1]
            TC[FFmpeg Pod<br/>replicas: 1-3]
        end

        subgraph Volumes
            PV1[(PV: raw-videos)]
            PV2[(PV: hls-output)]
        end
    end

    Internet((Internet)) --> Ingress
    Ingress -->|"/api/*"| BE
    Ingress -->|"/hls/*"| PV2
    Ingress -->|"/*"| FE

    BE --> TC
    TC --> PV1
    TC --> PV2

    style TC fill:#f90,color:#fff
```
