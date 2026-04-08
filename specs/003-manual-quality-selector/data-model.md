# Data Model: Manual Quality Selector

This feature is client-side only and introduces no persistent entities. The relevant state is ephemeral and lives in React component state during a playback session.

## Ephemeral State

### QualitySelection (in useHls hook)

| Field | Type | Description |
|-------|------|-------------|
| levels | Array<{height: number, index: number}> | Available HLS quality variants from the manifest |
| currentLevel | number | Active hls.js level index (-1 = Auto/ABR) |
| selectedLevel | number | User's dropdown selection (-1 = Auto, or level index) |

### Relationships

- `levels` is populated from `hls.levels` after `MANIFEST_PARSED` event
- `currentLevel` reflects the actual playing level (from `LEVEL_SWITCHED` event)
- `selectedLevel` is the user's intent — it drives `hls.currentLevel` assignment
- When `selectedLevel = -1`, ABR controls `currentLevel` automatically
- When `selectedLevel >= 0`, `currentLevel` is locked to match `selectedLevel`

### State Transitions

```
Auto (default) --[user selects 720p]--> Locked at 720p
Locked at 720p --[user selects Auto]--> Auto (ABR resumes)
Locked at 720p --[user selects 480p]--> Locked at 480p
```

No server-side data changes. No new API endpoints. No database entities.
