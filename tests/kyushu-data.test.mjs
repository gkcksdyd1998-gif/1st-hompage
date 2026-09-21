import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

test('curated Kyushu trip covers eight days without invented coordinates', async () => {
  const manifest = JSON.parse(await readFile(new URL('../src/data/photo-manifest.json', import.meta.url), 'utf8'));
  const trip = manifest.find(item => item.slug === 'fukuoka-nagasaki-yufuin-2026-08');
  assert.ok(trip, 'New trip must be imported');
  assert.equal(manifest.length, 8);
  assert.equal(trip.gpsImageCount, 0);
  assert.ok(trip.photos.length >= 60 && trip.photos.length <= 85);
  assert.equal(new Set(trip.photos.map(photo => photo.originalName)).size, trip.photos.length);
  assert.equal(new Set(trip.photos.map(photo => photo.takenAt.slice(0, 10))).size, 8);
  for (const photo of trip.photos) {
    assert.match(photo.takenAt, /^2026:08:(0[8-9]|1[0-5]) /);
    assert.equal(photo.latitude, undefined);
    assert.equal(photo.longitude, undefined);
    assert.equal(photo.mapUrl, undefined);
    await access(new URL(`../public${photo.src}`, import.meta.url));
  }
  assert.deepEqual(manifest, JSON.parse(await readFile(new URL('../public/photos/manifest.json', import.meta.url), 'utf8')));
});
