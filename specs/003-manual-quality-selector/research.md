# Research: Manual Quality Selector

## hls.js Quality Level API

**Decision**: Use `hls.currentLevel` to lock quality and `hls.currentLevel = -1` to restore auto (ABR).

**Rationale**: This is the official hls.js API for manual quality selection. Setting `currentLevel` to a specific index immediately switches to that level and disables ABR. Setting it to `-1` re-enables ABR. The `levels` array (available after `MANIFEST_PARSED`) provides the list of available quality variants with their `height` property (1080, 720, 480).

**Alternatives considered**:
- `hls.nextLevel`: Only affects the next segment load, doesn't persist. Not suitable for a "lock" behavior.
- `hls.loadLevel`: Controls which level to load but can be overridden by ABR. Not a clean lock.
- Custom ABR controller: Overkill for this use case.

## Dropdown Placement

**Decision**: Add the quality dropdown inside the existing `PlayerControls` component, alongside the current quality/bandwidth/buffer stats.

**Rationale**: Keeps the smart/dumb split clean. The dropdown is a presentational element that receives `levels`, `currentLevel`, and `onLevelChange` as props. No data fetching or side effects in the component.

**Alternatives considered**:
- Separate `QualitySelector` component: Unnecessary abstraction for a single `<select>` element. Would add a file without justification.
- Dropdown above/below the video: Breaks the existing layout pattern where all stats live in the controls bar.

## Level Index Mapping

**Decision**: Map between display labels ("Auto", "1080p", "720p", "480p") and hls.js level indices using the `levels` array's `height` property.

**Rationale**: The hls.js `levels` array order may vary between streams. Rather than hardcoding indices, we match by height value. "Auto" maps to index `-1`.

**Alternatives considered**:
- Hardcoded index mapping (0=1080, 1=720, 2=480): Fragile — depends on FFmpeg output order.
- Display raw level data: Not user-friendly for the demo audience.
