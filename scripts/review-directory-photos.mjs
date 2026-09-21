import { readdir, mkdir, writeFile } from "node:fs/promises";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import exifr from "exifr";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = process.argv[2];
if (!source) throw new Error("Provide a photo directory");
const output = join(root, ".photo-review");
await mkdir(output, { recursive: true });
const files = (await readdir(source)).filter(name => /\.(jpe?g|png)$/i.test(name)).sort();
const photos = [];
for (const [index, name] of files.entries()) {
  const path = join(source, name);
  try {
    const [exif, metadata] = await Promise.all([exifr.parse(path, { reviveValues: false }), sharp(path).metadata()]);
    const takenAt = exif?.DateTimeOriginal ?? exif?.CreateDate ?? null;
    photos.push({ index: index + 1, name, takenAt, latitude: exif?.latitude ?? null, longitude: exif?.longitude ?? null, width: metadata.width, height: metadata.height });
  } catch (error) { photos.push({ index: index + 1, name, error: String(error) }); }
}
await writeFile(join(output, "metadata.json"), JSON.stringify(photos, null, 2));
const summary = {};
for (const photo of photos) {
  const key = String(photo.takenAt ?? "unknown").slice(0, 10);
  summary[key] ??= { total: 0, gps: 0 };
  summary[key].total++;
  if (Number.isFinite(photo.latitude) && Number.isFinite(photo.longitude)) summary[key].gps++;
}
console.log(JSON.stringify({ count: photos.length, dates: summary, first: photos.slice(0,3) }, null, 2));
const candidates = photos.filter(photo => String(photo.takenAt).match(/^2026:08:(0[8-9]|1[0-5])/));
await writeFile(join(output, "candidates.json"), JSON.stringify(candidates, null, 2));
console.log("Dated August 8-15 candidates:", candidates.length);
for (let offset = 0; offset < candidates.length; offset += 30) {
  const group = candidates.slice(offset, offset + 30);
  const composites = [];
  for (const [index, photo] of group.entries()) {
    const left = index % 5 * 250;
    const top = Math.floor(index / 5) * 215;
    const buffer = await sharp(join(source, photo.name)).rotate().resize(246, 180, { fit: "inside" }).toBuffer();
    composites.push({ input: buffer, left, top });
    const label = `#${photo.index}  ${String(photo.takenAt).slice(5,16)}`;
    composites.push({ input: Buffer.from(`<svg width="250" height="30"><rect width="250" height="30" fill="white"/><text x="6" y="20" font-family="Arial" font-size="15" fill="black">${label}</text></svg>`), left, top: top + 182 });
  }
  const path = join(output, `sheet-${String(offset / 30 + 1).padStart(2,"0")}.jpg`);
  await sharp({ create: { width: 1250, height: Math.ceil(group.length / 5) * 215, channels: 3, background: "#eeeeee" } }).composite(composites).jpeg({ quality: 85 }).toFile(path);
  console.log(path);
}
