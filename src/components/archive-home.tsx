"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Camera,
  MapPin,
  Search,
  X,
} from "lucide-react";
import type { Trip } from "@/data/trips";

export function ArchiveHome({ trips }: { trips: Trip[] }) {
  const [year, setYear] = useState("all");
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("newest");
  const newest = [...trips].sort((a, b) => b.dates.localeCompare(a.dates))[0];
  const filtered = trips
    .filter(
      (trip) =>
        (year === "all" || trip.year === year) &&
        [
          trip.title,
          ...trip.cities,
          ...trip.days.flatMap(
            (day) =>
              day.placeGroups?.map(
                (place) => `${place.resolvedName ?? ""} ${place.area ?? ""}`,
              ) ?? [],
          ),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      order === "newest"
        ? b.dates.localeCompare(a.dates)
        : a.dates.localeCompare(b.dates),
    );
  return (
    <main>
      <header className="site-header">
        <Link href="/" className="brand">
          <span className="brand-mark">旅</span> 일본여행기
          <span className="brand-sub">A PERSONAL ARCHIVE</span>
        </Link>
        <a href="#journeys" className="header-link">
          여행 기록 <ArrowDown size={15} />
        </a>
      </header>
      <section className="home-intro page-width">
        <div>
          <p className="eyebrow">JAPAN, ONE JOURNEY AT A TIME</p>
          <h1>
            다시 펼치는
            <br />
            일본의 장면들<span className="accent-dot">.</span>
          </h1>
          <p className="intro-note">
            걸었던 길과 머물렀던 곳, 그리고 그날의 사진.
          </p>
        </div>
        <div className="archive-count">
          <strong>{trips.length.toString().padStart(2, "0")}</strong>
          <span>
            번의 여행 기록
            <br />
            2025 — 2026
          </span>
        </div>
      </section>
      <section className="featured page-width" aria-label="최근 여행">
        <Link href={`/trips/${newest.id}`} className="featured-link">
          <Image
            src={newest.cover}
            alt={newest.title}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
          <div className="featured-shade" />
          <div className="featured-copy">
            <p>가장 최근의 기록 · {newest.dates}</p>
            <h2>{newest.title.replace(" 여행", "")}</h2>
            <span>
              여행 펼쳐보기 <ArrowUpRight size={20} />
            </span>
          </div>
          <span className="featured-index">LATEST JOURNEY</span>
        </Link>
      </section>
      <section id="journeys" className="page-width journeys">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE COLLECTION</p>
            <h2>
              나의 여행들 <span>{filtered.length}</span>
            </h2>
          </div>
          <p className="quiet">사진 속 장소에서, 그날의 기억으로.</p>
        </div>
        <div className="archive-toolbar">
          <div className="segments" aria-label="여행 연도">
            {["all", "2026", "2025"].map((value) => (
              <button
                key={value}
                aria-pressed={year === value}
                onClick={() => setYear(value)}
              >
                {value === "all" ? "전체" : value}
              </button>
            ))}
          </div>
          <div className="search-field">
            <Search size={17} />
            <input
              aria-label="여행 및 장소 검색"
              placeholder="도시나 장소 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button
                className="icon-button"
                aria-label="검색 지우기"
                onClick={() => setQuery("")}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <select
            aria-label="여행 정렬"
            value={order}
            onChange={(event) => setOrder(event.target.value)}
          >
            <option value="newest">최신 여행순</option>
            <option value="oldest">오래된 여행순</option>
          </select>
        </div>
        <div className="trip-grid" aria-live="polite">
          {filtered.map((trip, index) => {
            const places = trip.days.flatMap((day) => day.placeGroups ?? []);
            return (
              <Link
                className="trip-card"
                href={`/trips/${trip.id}`}
                key={trip.id}
              >
                <div className="trip-cover">
                  <Image
                    src={trip.cover}
                    alt={trip.title}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
                  />
                  <span className="trip-year">{trip.year}</span>
                  <span className="trip-open">
                    <ArrowUpRight size={22} />
                  </span>
                </div>
                <div className="trip-card-heading">
                  <h3>{trip.title.replace(" 여행", "")}</h3>
                  <span className="trip-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="trip-dates">{trip.dates}</p>
                <p className="trip-mood">{trip.mood}</p>
                <div className="trip-meta">
                  <span>
                    <MapPin size={14} /> 장소 {places.length}곳
                  </span>
                  <span>
                    <Camera size={14} /> 기록 사진{" "}
                    {
                      new Set([
                        ...trip.photos.map(
                          (photo) => photo.originalName ?? photo.src,
                        ),
                        ...places.map((place) => place.originalName),
                      ]).size
                    }
                    장
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        {!filtered.length && (
          <div className="empty-state">
            <Search size={28} />
            <h3>일치하는 여행이 없어요</h3>
            <button
              onClick={() => {
                setQuery("");
                setYear("all");
              }}
            >
              전체 여행 보기
            </button>
          </div>
        )}
      </section>
      <footer className="site-footer page-width">
        <span>일본여행기</span>
        <span>사진으로 남긴 나의 일본 · 2025 — 2026</span>
      </footer>
    </main>
  );
}
