"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Camera,
  MapPin,
  Maximize2,
  Route,
  Images,
} from "lucide-react";
import type { Trip } from "@/data/trips";
import type { MapPlace } from "./route-map";
import { PhotoViewer, type ViewPhoto } from "./photo-viewer";
const RouteMap = dynamic(() => import("./route-map"), {
  ssr: false,
  loading: () => <div className="map-loading">지도 불러오는 중...</div>,
});
function time(value: string) {
  return value.match(/\s(\d{2}:\d{2})/)?.[1] ?? value;
}
function datesFor(trip: Trip) {
  const [start, end] = trip.dates
    .split(" - ")
    .map((date) => new Date(date.replaceAll(".", "-") + "T00:00:00Z"));
  const dates: string[] = [];
  for (
    let date = start;
    date <= end;
    date = new Date(date.getTime() + 86400000)
  )
    dates.push(date.toISOString().slice(0, 10).replaceAll("-", "."));
  return dates;
}
export function TripExplorer({
  trip,
  journeys,
}: {
  trip: Trip;
  journeys: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [day, setDay] = useState("all");
  const [view, setView] = useState("story");
  const [selected, setSelected] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{
    photos: ViewPhoto[];
    index: number;
  } | null>(null);
  const allPlaces = useMemo<MapPlace[]>(
    () =>
      trip.days
        .flatMap((day) =>
          (day.placeGroups ?? []).map((place) => ({ ...place, day: day.day })),
        )
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .map((place, index) => ({ ...place, number: index + 1 })),
    [trip],
  );
  const places = useMemo(
    () => allPlaces.filter((place) => day === "all" || place.day === day),
    [allPlaces, day],
  );
  const dates = useMemo(() => datesFor(trip), [trip]);
  const photos = useMemo<ViewPhoto[]>(() => {
    const representativeNames = new Set(
      places.map((place) => place.originalName),
    );
    const gallery = trip.photos
      .filter(
        (photo) =>
          !representativeNames.has(photo.originalName ?? "") &&
          (day === "all" ||
            photo.takenAt?.slice(0, 10).replaceAll(":", ".") === day),
      )
      .map((photo) => ({
        src: photo.src,
        title: photo.caption,
        detail: photo.takenAt?.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1.$2.$3"),
        mapUrl: photo.mapUrl,
      }));
    const representatives = places.map((place) => ({
      src: place.representative,
      title: place.resolvedName ?? place.area ?? `장소 ${place.number}`,
      detail: `${place.day} · ${time(place.startTime)} · ${place.area ?? ""}`,
      mapUrl: place.mapUrl,
    }));
    return [...representatives, ...gallery];
  }, [trip, day, places]);
  const selectedPlace = places.find(
    (place) => place.representative === selected,
  );
  function selectPlace(src: string) {
    setSelected(src);
    document
      .getElementById(
        `place-${allPlaces.find((place) => place.representative === src)?.number}`,
      )
      ?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "nearest",
      });
  }
  return (
    <main>
      <header className="site-header detail-header">
        <Link href="/" className="brand">
          <span className="brand-mark">旅</span> 일본여행기
        </Link>
        <select
          aria-label="다른 여행 선택"
          value={trip.id}
          onChange={(event) => router.push(`/trips/${event.target.value}`)}
        >
          {journeys.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </header>
      <div className="page-width trip-heading">
        <Link className="back-link" href="/#journeys">
          <ArrowLeft size={16} /> 모든 여행
        </Link>
        <div className="trip-title-row">
          <div>
            <p className="eyebrow">{trip.cities.join(" / ").toUpperCase()}</p>
            <h1>{trip.title.replace(" 여행", "")}</h1>
            <p className="trip-period">
              {trip.dates}{" "}
              <span>
                · {dates.length - 1}박 {dates.length}일
              </span>
            </p>
          </div>
          <p className="trip-mood">{trip.mood}</p>
        </div>
      </div>
      <div className="trip-panorama page-width">
        <Image
          src={trip.cover}
          alt={trip.title}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
        />
        <span className="panorama-label">
          <Camera size={14} /> {trip.title}에서
        </span>
      </div>
      <section className="explorer page-width">
        <div className="explorer-toolbar">
          <div className="view-tabs" aria-label="기록 보기">
            <button
              aria-pressed={view === "story"}
              onClick={() => setView("story")}
            >
              <Route size={17} /> 여정
            </button>
            <button
              aria-pressed={view === "photos"}
              onClick={() => setView("photos")}
            >
              <Images size={17} /> 사진 <span>{photos.length}</span>
            </button>
          </div>
          <span className="quiet">{allPlaces.length}개 장소의 기억</span>
        </div>
        <div className="day-tabs" aria-label="날짜 선택">
          <button
            aria-pressed={day === "all"}
            onClick={() => {
              setDay("all");
              setSelected(null);
            }}
          >
            전체 일정
          </button>
          {dates.map((date, index) => (
            <button
              key={date}
              aria-pressed={day === date}
              onClick={() => {
                setDay(date);
                setSelected(null);
              }}
            >
              <span>DAY {index + 1}</span>
              {date.slice(5).replace(".", "/")}
            </button>
          ))}
        </div>
        {view === "story" ? (
          <div className="story-layout">
            <div className="timeline">
              <div className="timeline-heading">
                <h2>{day === "all" ? "여행의 발자취" : day}</h2>
                <span>{places.length}곳</span>
              </div>
              {!places.length && (
                <div className="empty-state">
                  <MapPin size={28} />
                  <h3>이날은 위치 기록이 없어요</h3>
                  <p>촬영 위치가 남아 있는 사진이 없습니다.</p>
                  <button onClick={() => setView("photos")}>
                    이날의 사진 보기
                  </button>
                </div>
              )}
              {places.map((place, index) => (
                <div key={place.representative}>
                  {(index === 0 || places[index - 1].day !== place.day) &&
                    day === "all" && (
                      <div className="timeline-date">
                        {place.day}
                        <span>DAY {dates.indexOf(place.day) + 1}</span>
                      </div>
                    )}
                  <article
                    id={`place-${place.number}`}
                    className={`place-row ${selected === place.representative ? "is-active" : ""}`}
                  >
                    <div className="place-rail">
                      <button
                        aria-label={`지도에서 ${place.resolvedName ?? place.label} 선택`}
                        aria-pressed={selected === place.representative}
                        onClick={() => setSelected(place.representative)}
                      >
                        {place.number}
                      </button>
                      <span />
                    </div>
                    <div className="place-content">
                      <div className="place-time">
                        {time(place.startTime)}
                        {time(place.endTime) !== time(place.startTime) &&
                          ` – ${time(place.endTime)}`}
                      </div>
                      <button
                        className="place-name"
                        onClick={() => setSelected(place.representative)}
                      >
                        {place.resolvedName ??
                          place.area ??
                          `장소 ${place.number}`}
                        <ArrowUpRight size={16} />
                      </button>
                      <p className="place-area">
                        <MapPin size={13} />
                        {place.area ??
                          `${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}`}{" "}
                        부근
                      </p>
                      <button
                        className="place-image"
                        aria-label={`${place.resolvedName ?? place.label} 사진 확대`}
                        onClick={() =>
                          setViewer({
                            photos,
                            index: photos.findIndex(
                              (photo) => photo.src === place.representative,
                            ),
                          })
                        }
                      >
                        <Image
                          src={place.representative}
                          alt={place.resolvedName ?? place.label}
                          fill
                          sizes="(max-width: 800px) 100vw, 480px"
                        />
                        <span>
                          <Maximize2 size={17} />
                        </span>
                      </button>
                      <div className="place-bottom">
                        <span>
                          <Camera size={13} /> 인근 촬영 {place.photoCount}장
                        </span>
                        <a href={place.mapUrl} target="_blank" rel="noreferrer">
                          지도 열기 <ArrowUpRight size={14} />
                        </a>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
            <aside className="map-aside">
              <div className="map-heading">
                <h2>
                  <MapPin size={18} /> 그날의 장소
                </h2>
                <span>{places.length}곳</span>
              </div>
              {places.length ? (
                <RouteMap
                  places={places}
                  selected={selected}
                  onSelect={selectPlace}
                />
              ) : (
                <div className="map-loading">표시할 위치 기록이 없습니다</div>
              )}
              <div className="map-caption" aria-live="polite">
                {selectedPlace ? (
                  <>
                    <strong>
                      {selectedPlace.number}.{" "}
                      {selectedPlace.resolvedName ?? selectedPlace.label}
                    </strong>
                    <p>
                      {selectedPlace.area} 부근 ·{" "}
                      {time(selectedPlace.startTime)}
                    </p>
                  </>
                ) : (
                  <>
                    <strong>{day === "all" ? "여행 전체" : day}</strong>
                    <p>
                      점선은 촬영 순서이며 실제 이동 경로와 다를 수 있습니다.
                    </p>
                  </>
                )}
              </div>
              <p className="location-note">
                장소명은 사진 좌표 기준 추정 위치입니다.
              </p>
            </aside>
          </div>
        ) : (
          <div className="photo-collection">
            <div className="timeline-heading">
              <h2>{day === "all" ? "장면 모아보기" : `${day}의 장면`}</h2>
              <span>{photos.length}장</span>
            </div>
            {!photos.length && (
              <div className="empty-state">
                <Camera size={28} />
                <h3>이날 등록된 사진이 없어요</h3>
                <button onClick={() => setDay("all")}>전체 사진 보기</button>
              </div>
            )}
            <div className="photo-grid">
              {photos.map((photo, index) => (
                <button
                  key={photo.src}
                  className="gallery-photo"
                  onClick={() => setViewer({ photos, index })}
                  aria-label={`${photo.title} 사진 확대`}
                >
                  <div>
                    <Image
                      src={photo.src}
                      alt={photo.title}
                      fill
                      sizes="(max-width: 600px) 50vw, 33vw"
                    />
                  </div>
                  <span>{photo.title}</span>
                  <small>{photo.detail?.split(" · ")[0]}</small>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
      <footer className="site-footer page-width">
        <Link href="/#journeys">
          <ArrowLeft size={16} /> 모든 여행으로
        </Link>
        <span>
          {trip.title} · {trip.year}
        </span>
      </footer>
      {viewer && (
        <PhotoViewer
          photos={viewer.photos}
          index={viewer.index}
          onChange={(index) => setViewer({ ...viewer, index })}
          onClose={() => setViewer(null)}
        />
      )}
    </main>
  );
}
