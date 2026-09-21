import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import exifr from "exifr";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = process.argv[2];
if (!source) throw new Error("Provide the original photo directory");
const selection = JSON.parse(await readFile(join(root, "scripts/selections/kyushu-2026-08.json"), "utf8"));
const photos = [];
const output = join(root, "public/photos", selection.slug);
await mkdir(output, { recursive: true });
for (const { originalName, caption } of selection.photos) {
  if (basename(originalName) !== originalName) throw new Error("Invalid source filename");
  const original = join(source, originalName);
  const exif = await exifr.parse(original, { reviveValues: false });
  const takenAt = exif?.DateTimeOriginal ?? exif?.CreateDate;
  if (!/^2026:08:(0[8-9]|1[0-5]) /.test(takenAt ?? "")) throw new Error(`Unexpected date: ${originalName}`);
  if (Number.isFinite(exif?.latitude) || Number.isFinite(exif?.longitude)) throw new Error("GPS differs from reviewed source; review before importing");
  await sharp(original).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toFile(join(output, originalName));
  photos.push({ src: `/photos/${selection.slug}/${originalName}`, alt: caption, caption, originalName, takenAt });
}
photos.sort((a, b) => a.takenAt.localeCompare(b.takenAt) || a.originalName.localeCompare(b.originalName));
const trip = { slug: selection.slug, name: selection.name, originalImageCount: 386, gpsImageCount: 0, importedImageCount: photos.length, cover: `/photos/${selection.slug}/${selection.cover}`, photos };
const manifestPath = join(root, "src/data/photo-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const existing = manifest.findIndex(item => item.slug === trip.slug);
if (existing < 0) manifest.push(trip);
else manifest[existing] = trip;
const json = JSON.stringify(manifest, null, 2) + "\n";
await writeFile(manifestPath, json);
await writeFile(join(root, "public/photos/manifest.json"), json);
console.log(JSON.stringify({ slug: trip.slug, selected: photos.length, gps: trip.gpsImageCount }));
