import { trips, travelStats } from "@/data/trips";
import type { CSSProperties } from "react";

const cityNotes = [
  { city: "Tokyo", note: "밤거리와 골목 사진을 모으기 좋은 기준점" },
  { city: "Osaka", note: "먹는 기억과 이동 동선이 가장 선명한 도시" },
  { city: "Fukuoka", note: "짧게 다녀와도 여운이 오래 남는 곳" },
  { city: "Kyoto", note: "계절별로 다시 찍고 싶은 장면이 많은 도시" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f5ef] text-[#171717]">
      <section className="relative overflow-hidden border-b border-[#ded6c8] bg-[#151515] text-white">
        <div className="absolute inset-0 opacity-45">
          <div className="h-full w-full bg-[linear-gradient(120deg,rgba(6,6,6,.95),rgba(6,6,6,.42)),url('/photos/tokyo-winter/cover.jpg')] bg-cover bg-center" />
        </div>
        <div className="relative mx-auto grid min-h-[76vh] max-w-6xl content-end px-5 pb-12 pt-24 sm:px-8 lg:px-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-[#e6cf9f]">
            Japan Travel Archive
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
            일본에서 걸었던 길과 찍어둔 장면들
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#f1eadf]">
            작년 5번, 올해 3번. 여행마다 남긴 사진, 이동 경로, 장소의
            분위기와 다시 보고 싶은 순간을 한곳에 정리하는 개인 여행기입니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-3 sm:grid-cols-4">
          <Stat label="전체 여행" value={`${travelStats.totalTrips}회`} />
          <Stat label="2025년" value={`${travelStats.lastYearTrips}회`} />
          <Stat label="2026년" value={`${travelStats.thisYearTrips}회`} />
          <Stat label="기록 도시" value={`${travelStats.visitedCities}곳`} />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-14 sm:px-8 lg:grid-cols-[1.4fr_.8fr] lg:px-10">
        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#9a4f33]">Trips</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-normal">
                여행별 기록
              </h2>
            </div>
            <p className="hidden text-sm text-[#6f665c] sm:block">
              사진 폴더를 채우면 실제 갤러리로 확장할 자리
            </p>
          </div>

          <div className="grid gap-4">
            {trips.map((trip) => (
              <article
                key={trip.id}
                className="grid overflow-hidden rounded-lg border border-[#ddd3c4] bg-white shadow-sm sm:grid-cols-[220px_1fr]"
              >
                <div
                  className="min-h-48 bg-[#d6c5ad] bg-[linear-gradient(135deg,rgba(20,20,20,.18),rgba(20,20,20,.02)),var(--cover)] bg-cover bg-center"
                  style={{ "--cover": `url(${trip.cover})` } as CSSProperties}
                >
                  <div className="flex h-full items-end p-4">
                    <span className="rounded-md bg-black/70 px-3 py-1 text-sm font-semibold text-white">
                      {trip.dates}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {trip.cities.map((city) => (
                      <span
                        key={city}
                        className="rounded-md bg-[#efe8dc] px-2.5 py-1 text-xs font-semibold text-[#594331]"
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-normal">
                    {trip.title}
                  </h3>
                  <p className="mt-2 leading-7 text-[#5d554c]">{trip.summary}</p>
                  <div className="mt-5 grid gap-3 text-sm text-[#4b443d] sm:grid-cols-2">
                    <div>
                      <p className="font-semibold text-[#171717]">기억 키워드</p>
                      <p className="mt-1">{trip.mood}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#171717]">사진 기록</p>
                      <p className="mt-1">선별 예정 사진 {trip.photoCount}장</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-[#ddd3c4] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#9a4f33]">Route Memory</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal">
              이동 경로 메모
            </h2>
            <div className="mt-5 space-y-4">
              {trips.map((trip) => (
                <div key={trip.id}>
                  <p className="text-sm font-semibold">{trip.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#6a6259]">
                    {trip.route.join(" -> ")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#ddd3c4] bg-[#24211e] p-5 text-white shadow-sm">
            <p className="text-sm font-semibold text-[#e6cf9f]">Cities</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal">
              다시 꺼내볼 도시들
            </h2>
            <div className="mt-5 space-y-4">
              {cityNotes.map((item) => (
                <div key={item.city} className="border-t border-white/15 pt-4">
                  <p className="font-semibold">{item.city}</p>
                  <p className="mt-1 text-sm leading-6 text-[#e8dfd2]">
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#ddd3c4] bg-white px-5 py-4 shadow-sm">
      <p className="text-sm font-semibold text-[#766b60]">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-normal">{value}</p>
    </div>
  );
}
