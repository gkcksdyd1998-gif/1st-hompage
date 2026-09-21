# Travel archive interface

The archive uses the existing Next.js application and imported photo manifests.
It does not require a database or photo re-import.

- Home: chronological travel collection, year filter, city/place search, sort.
- Trip: calendar-day filter shared by the story map and photo collection.
- Map: OpenStreetMap tiles, chronological lines grouped by day, clustered markers,
  selection synchronized with the itinerary, and a fit-all control.
- Photos: representative images and imported gallery images, deduplicated by
  original filename; accessible native dialog with arrow-key navigation.
- Missing GPS days stay visible. Location names remain approximate; lines show
  capture order, not a reconstructed road route.

Components live under src/components. Route files load the existing trip data.
The map is client-loaded only on trip pages.

## Verification

Run npm run lint, then npm run build.
Run npm run start -- --port 3100, then npx playwright test.
Playwright uses installed Chrome; PLAYWRIGHT_BASE_URL can select another server.
Do not build while the dev server is generating route files.

Build and dev use Webpack after local Turbopack generated invalid route type
files. The old build cache was retained outside the repository.
Screenshots and temporary design previews are ignored by Git.
