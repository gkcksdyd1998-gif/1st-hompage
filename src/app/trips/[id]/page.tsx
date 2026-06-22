import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { trips, type TripPhoto } from "@/data/trips";

type TripPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type RoutePoint = TripPhoto & {
  latitude: number;
  longitude: number;
  x: number;
  y: number;
};

export function generateStaticParams() {
  return trips.map((trip) => ({
    id: trip.id,
  }));
}

export async function generateMetadata({ params }: TripPageProps) {
  const { id } = await params;
  const trip = trips.find((item) => item.id === id);

  if (!trip) {
    return {
      title: "여행 기록을 찾을 수 없음",
    };
  }

  return {
    title: `${trip.title} | 일본여행기`,
    description: trip.summary,
  };
}

export default async function TripPage({ params }: TripPageProps) {
  const { id } = await params;
  const trip = trips.find((item) => item.id === id);

  if (!trip) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-[#171717]">
      <section
        className="relative overflow-hidden bg-[#151515] text-white"
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(6,6,6,.86), rgba(6,6,6,.3)), url(${trip.cover})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="mx-auto min-h-[58vh] max-w-6xl px-5 pb-12 pt-8 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="inline-flex rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/18"
          >
            홈으로
          </Link>
          <div className="mt-24 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#e6cf9f]">
              {trip.dates}
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.04] tracking-normal sm:text-6xl">
              {trip.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#f1eadf]">
              {trip.summary}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_320px] lg:px-10">
        <div className="space-y-8">
          <TripRouteMap photos={trip.photos} />

          <section>
            <p className="text-sm font-semibold text-[#9a4f33]">Timeline</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">
              날짜별 일정
            </h2>
            <div className="mt-5 space-y-4">
              {trip.days.map((day) => (
                <article
                  key={day.day}
                  className="rounded-lg border border-[#ddd3c4] bg-white p-5 shadow-sm"
                >
                  <p className="text-sm font-semibold text-[#9a4f33]">
                    {day.day}
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold tracking-normal">
                    {day.title}
                  </h3>
                  <p className="mt-3 leading-7 text-[#5d554c]">{day.note}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {day.places.map((place) => (
                      <span
                        key={place}
                        className="rounded-md bg-[#efe8dc] px-2.5 py-1 text-xs font-semibold text-[#594331]"
                      >
                        {place}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <p className="text-sm font-semibold text-[#9a4f33]">Photos</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal">
              장소 기록 사진
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6f665c]">
              GPS EXIF가 남아 있는 사진을 우선으로 골랐고, 좌표가 있는
              사진은 지도 링크를 함께 표시합니다.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {trip.photos.map((photo) => (
                <figure
                  key={photo.src}
                  className="overflow-hidden rounded-lg border border-[#ddd3c4] bg-white shadow-sm"
                >
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="space-y-2 p-4 text-sm text-[#5d554c]">
                    <p className="font-semibold">{photo.caption}</p>
                    {photo.takenAt ? (
                      <p>촬영시간: {formatTakenAt(photo.takenAt)}</p>
                    ) : null}
                    {photo.latitude && photo.longitude ? (
                      <p>
                        좌표: {photo.latitude.toFixed(5)},{" "}
                        {photo.longitude.toFixed(5)}
                      </p>
                    ) : null}
                    {photo.mapUrl ? (
                      <a
                        href={photo.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-md bg-[#efe8dc] px-2.5 py-1 text-xs font-semibold text-[#594331] transition hover:bg-[#e0d2bf]"
                      >
                        지도에서 보기
                      </a>
                    ) : (
                      <p className="text-xs text-[#8a8177]">
                        GPS 기록이 없는 사진
                      </p>
                    )}
                    {photo.originalName ? (
                      <p className="text-xs text-[#8a8177]">
                        원본: {photo.originalName}
                      </p>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-[#ddd3c4] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#9a4f33]">Cities</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {trip.cities.map((city) => (
                <span
                  key={city}
                  className="rounded-md bg-[#efe8dc] px-2.5 py-1 text-xs font-semibold text-[#594331]"
                >
                  {city}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#ddd3c4] bg-[#24211e] p-5 text-white shadow-sm">
            <p className="text-sm font-semibold text-[#e6cf9f]">Route</p>
            <p className="mt-3 text-sm leading-7 text-[#e8dfd2]">
              {trip.route.join(" -> ")}
            </p>
          </section>

          <section className="rounded-lg border border-[#ddd3c4] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#9a4f33]">Highlights</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#5d554c]">
              {trip.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}

function TripRouteMap({ photos }: { photos: TripPhoto[] }) {
  const sortedPhotos = photos
    .filter(
      (photo) =>
        typeof photo.latitude === "number" &&
        typeof photo.longitude === "number",
    )
    .sort((a, b) => (a.takenAt ?? "").localeCompare(b.takenAt ?? ""));

  if (sortedPhotos.length === 0) {
    return null;
  }

  const latitudes = sortedPhotos.map((photo) => photo.latitude as number);
  const longitudes = sortedPhotos.map((photo) => photo.longitude as number);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const latSpan = Math.max(maxLat - minLat, 0.001);
  const lngSpan = Math.max(maxLng - minLng, 0.001);
  const padding = 70;
  const width = 1000;
  const height = 620;

  const points: RoutePoint[] = sortedPhotos.map((photo) => {
    const longitude = photo.longitude as number;
    const latitude = photo.latitude as number;

    return {
      ...photo,
      latitude,
      longitude,
      x: padding + ((longitude - minLng) / lngSpan) * (width - padding * 2),
      y:
        height -
        padding -
        ((latitude - minLat) / latSpan) * (height - padding * 2),
    };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  return (
    <section className="rounded-lg border border-[#ddd3c4] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#9a4f33]">GPS Route</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-normal">
            촬영시간 순 이동 경로
          </h2>
        </div>
        <p className="text-sm font-semibold text-[#6f665c]">
          {points.length}개 GPS 포인트
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#ded6c8] bg-[#f4efe5]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="촬영시간 순서대로 연결한 GPS 이동 경로"
          className="h-auto w-full"
        >
          <defs>
            <pattern
              id="map-grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="#ded6c8"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#map-grid)" />
          <path
            d={path}
            fill="none"
            stroke="#9a4f33"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="8"
          />
          {points.map((point, index) => (
            <g key={`${point.src}-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                fill={index === 0 ? "#2f6f4e" : "#ffffff"}
                r="20"
                stroke={index === points.length - 1 ? "#151515" : "#9a4f33"}
                strokeWidth="6"
              />
              <text
                x={point.x}
                y={point.y + 6}
                fill={index === 0 ? "#ffffff" : "#171717"}
                fontSize="20"
                fontWeight="700"
                textAnchor="middle"
              >
                {index + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-[#5d554c] sm:grid-cols-2">
        <RouteEndpoint label="시작" point={firstPoint} />
        <RouteEndpoint label="마지막" point={lastPoint} />
      </div>
    </section>
  );
}

function RouteEndpoint({ label, point }: { label: string; point: RoutePoint }) {
  return (
    <div className="rounded-lg bg-[#f8f5ef] p-4">
      <p className="font-semibold text-[#171717]">{label}</p>
      <p className="mt-1">{formatTakenAt(point.takenAt ?? "")}</p>
      <p className="mt-1">
        {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
      </p>
      {point.mapUrl ? (
        <a
          href={point.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex rounded-md bg-[#efe8dc] px-2.5 py-1 text-xs font-semibold text-[#594331] transition hover:bg-[#e0d2bf]"
        >
          지도에서 보기
        </a>
      ) : null}
    </div>
  );
}

function formatTakenAt(value: string) {
  const match = value.match(
    /^(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/,
  );

  if (!match) {
    return value;
  }

  return `${match[1]}.${match[2]}.${match[3]} ${match[4]}:${match[5]}`;
}
