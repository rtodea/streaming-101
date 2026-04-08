# Quickstart: Manual Quality Selector

## Test Scenario 1: VOD Quality Switching

1. Start the stack: `docker compose up`
2. Upload a video via the Presenter Dashboard at `http://localhost:5173/presenter`
3. Wait for transcoding to complete (all 3 quality levels)
4. Open the video player from the catalog
5. Verify the quality dropdown shows: Auto, 1080p, 720p, 480p
6. Select "480p" — video should visibly reduce in quality, quality indicator updates
7. Select "1080p" — video should sharpen, quality indicator updates
8. Select "Auto" — player resumes adaptive bitrate

## Test Scenario 2: Live Stream Quality Switching

1. Start a live camera stream from the Presenter Dashboard
2. Open the live player on another tab/device
3. Verify the quality dropdown appears with available levels
4. Switch between quality levels during the live broadcast
5. Verify segments continue to arrive at the locked quality

## Test Scenario 3: Partial Availability

1. Upload a video and open the player before transcoding finishes
2. Verify the dropdown only shows quality levels that are available
3. As transcoding completes additional levels, verify they appear in the dropdown

## Demo Script

During the presentation:
1. Show the player with Auto selected — point out quality badge changing as ABR adapts
2. Lock to 480p — audience sees quality drop, bandwidth decreases on stats panel
3. Lock to 1080p — quality jumps, bandwidth increases
4. Switch back to Auto — explain this is how Netflix/YouTube work
5. Have audience members on their phones try switching quality on the same stream
