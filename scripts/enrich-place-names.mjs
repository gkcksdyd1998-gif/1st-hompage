import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const manifestPath = resolve("src/data/place-manifest.json");
const cachePath = resolve("src/data/geocode-cache.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const cache = existsSync(cachePath)
  ? JSON.parse(readFileSync(cachePath, "utf8"))
  : {};

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function compact(values) {
  return values.filter(Boolean).join(", ");
}

function pickLocation(data) {
  const address = data.address ?? {};
  const namedPlace =
    address.tourism ??
    address.attraction ??
    address.amenity ??
    address.shop ??
    address.building ??
    address.road ??
    address.pedestrian ??
    address.neighbourhood ??
    address.suburb ??
    address.quarter ??
    data.name;

  const area = compact([
    address.neighbourhood ?? address.suburb ?? address.quarter,
    address.city ?? address.town ?? address.village ?? address.municipality,
    address.state,
  ]);

  return {
    resolvedName: namedPlace || data.display_name || "위치명 확인 필요",
    area: area || data.display_name || "주변 지역 확인 필요",
    address: data.display_name ?? "",
    geocodeSource: "OpenStreetMap Nominatim",
  };
}

async function reverseGeocode(latitude, longitude) {
  const key = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;

  if (cache[key]) {
    return cache[key];
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("zoom", "18");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "ko,en,ja");

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "japan-travel-archive/1.0 (personal travel archive geocoding)",
    },
  });

  if (!response.ok) {
    throw new Error(`Reverse geocode failed for ${key}: ${response.status}`);
  }

  const data = await response.json();
  const location = pickLocation(data);
  cache[key] = location;
  writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
  await sleep(1100);
  return location;
}

let count = 0;

for (const trip of manifest) {
  for (const day of trip.days ?? []) {
    for (const place of day.placeGroups ?? []) {
      if (typeof place.latitude !== "number" || typeof place.longitude !== "number") {
        continue;
      }

      const location = await reverseGeocode(place.latitude, place.longitude);
      place.resolvedName = location.resolvedName;
      place.area = location.area;
      place.address = location.address;
      place.geocodeSource = location.geocodeSource;
      count += 1;
    }
  }
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Enriched ${count} representative places.`);
