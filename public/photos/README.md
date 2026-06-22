# Photo folders

This folder contains web-optimized travel photos for the site.

The current photos were generated from:

```text
C:\Users\82102\Downloads\일본여행.zip
```

Run this from the project root to regenerate the gallery images:

```powershell
powershell.exe -ExecutionPolicy Bypass -File scripts\import-travel-photos.ps1 -ZipPath "C:\Users\82102\Downloads\일본여행.zip" -PhotosPerTrip 12 -MaxWidth 1600
```

The import script prefers photos with GPS EXIF metadata. It also writes
`src/data/photo-manifest.json`, which is used by the trip detail pages to show
shooting time, coordinates, and map links.

It also groups all GPS-tagged photos by date and nearby coordinates, then writes
`src/data/place-manifest.json`. The detail pages use that file to build the
automatic itinerary and representative place cards.

Recommended structure:

```text
public/photos/
  kyoto-nara-2025-02/
    cover.jpg
    001.jpg
    002.jpg
  kagoshima-2026-05/
    cover.jpg
```

Files inside `public` are served from the site root. For example:

```ts
cover: "/photos/kyoto-nara-2025-02/cover.jpg"
```
