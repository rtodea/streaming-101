# TODOs

## Presentation Slides

1. Find something that converts MD to slides that I can show case

## Application

1. We will try to replicate Youtube/Netflix
2. Parts: creator, viewer
3. Server side: pick a framework that supports all of this (NextJS or NestJS)
4. We will need some infrastructure, so use k8s (actually k3s)
5. We will want to deploy this on my server (tadeo.ro, todea.eu)

## Use cases

### Video Content Raw Format

1. Generate video content (don't focus at all on the audio) using a simple tool so we can showcase what the raw format is (trace maybe individual pixels, could be a checkers board) 
2. Uploading pre-generated video content through the creator page
3. Watching how the content is being created in various versions (low, medium, high quality)
4. Look at the individual pixels for each of these contents to showcase what lower quality actually means

### Viewer gets right track based on bandwidth quality

1. Viewer goes to the video catalog
2. Clicks on the previously uploaded content (one entry, regardless of video variations of low/medium/high)
3. Has 4 options in the player (low, medium, high, auto)
4. Pick auto and explain how it works behind the scenes to pick the right version

### Seting up a Live stream as a creator

1. Back to creator mode
2. Have a digital camera connected to laptop
3. Film a small screen with current time (to the milisecond level)
4. Start streaming mode
5. Understand if that is the highest quality available
6. Are there any processing happening on the backend? do we get the low/medium/high split somewhere?

### Consuming the live stream as a viewer

1. Viewer goes to a the video catalog, and now sees a live stream entry
2. Connects there
3. On the page, beside the live video content, we also have a current time (to the milisecond level)
4. We also show current viewer count

### Wow factor #1

1. We ask multiple people to act as viewers from their mobile phones (by using some on-screen QR code)
2. We show some live stats about the viewers (their bandwidth data, etc.)
3. We show some live stats about the server load when more people are connecting
4. We ask people to observe the delay of the stream (milisecond level) while we tweak stuff live on the server via some configuration

### Wow factor #2

1. We ask them to cover their phones so their bandwidth is poorer
2. We some some stats dramatically changing while doing that
3. Not sure if we should do that with live or with streams


