#!/bin/bash
# Generate a fallback test video with HLS variants
# Requires: ffmpeg
# Usage: ./scripts/generate-fallback.sh [output-dir]

set -euo pipefail

OUTPUT_DIR="${1:-./data/hls/vod/fallback}"

echo "Generating fallback video in $OUTPUT_DIR..."

mkdir -p "$OUTPUT_DIR"

# Generate a 30-second test pattern video with audio tone
ffmpeg -y \
  -f lavfi -i "testsrc2=duration=30:size=1920x1080:rate=30" \
  -f lavfi -i "sine=frequency=440:duration=30" \
  -c:v libx264 -preset fast -pix_fmt yuv420p \
  -c:a aac -b:a 128k \
  "$OUTPUT_DIR/original.mp4"

# Transcode to 3 quality levels
for quality in "480p:854:480:800k" "720p:1280:720:2800k" "1080p:1920:1080:5000k"; do
  IFS=: read -r name w h bitrate <<< "$quality"
  mkdir -p "$OUTPUT_DIR/$name"
  ffmpeg -y -i "$OUTPUT_DIR/original.mp4" \
    -vf "scale=${w}:${h}" \
    -c:v libx264 -preset fast -b:v "$bitrate" \
    -c:a aac -b:a 128k \
    -hls_time 4 -hls_list_size 0 \
    -hls_segment_filename "$OUTPUT_DIR/$name/segment-%03d.ts" \
    -f hls "$OUTPUT_DIR/$name/stream.m3u8"
  echo "  ✓ $name"
done

# Master manifest
cat > "$OUTPUT_DIR/master.m3u8" << 'MANIFEST'
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=854x480
480p/stream.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p/stream.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p/stream.m3u8
MANIFEST

rm -f "$OUTPUT_DIR/original.mp4"

echo "Done! Fallback video ready at $OUTPUT_DIR/master.m3u8"
