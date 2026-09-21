import photoManifest from "./photo-manifest.json";
import placeManifest from "./place-manifest.json";

export type TripDay = {
  day: string;
  title: string;
  places: string[];
  note: string;
  placeGroups?: PlaceGroup[];
};

export type TripPhoto = {
  src: string;
  alt: string;
  caption: string;
  originalName?: string;
  takenAt?: string;
  latitude?: number;
  longitude?: number;
  mapUrl?: string;
};

export type PlaceGroup = {
  label: string;
  photoCount: number;
  representative: string;
  originalName: string;
  startTime: string;
  endTime: string;
  latitude: number;
  longitude: number;
  mapUrl: string;
  resolvedName?: string;
  area?: string;
  address?: string;
  geocodeSource?: string;
};

export type Trip = {
  id: string;
  title: string;
  year: "2025" | "2026";
  dates: string;
  cities: string[];
  mood: string;
  cover: string;
  summary: string;
  highlights: string[];
  route: string[];
  photoCount: number;
  locationNote?: string;
  days: TripDay[];
  photos: TripPhoto[];
};

type PhotoManifestTrip = {
  slug: string;
  photos: TripPhoto[];
};

type PlaceManifestTrip = {
  slug: string;
  days: Array<TripDay & { placeGroups?: PlaceGroup[] }>;
};

function makePhotos(slug: string, title: string, count = 12): TripPhoto[] {
  const manifestTrip = (photoManifest as PhotoManifestTrip[]).find(
    (item) => item.slug === slug,
  );

  if (manifestTrip) {
    return manifestTrip.photos;
  }

  return Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");

    return {
      src: `/photos/${slug}/${number}.jpg`,
      alt: `${title} 사진 ${index + 1}`,
      caption: `${title} #${index + 1}`,
    };
  });
}

function makeDays(slug: string, fallbackDays: TripDay[]): TripDay[] {
  const manifestTrip = (placeManifest as PlaceManifestTrip[]).find(
    (item) => item.slug === slug,
  );

  if (!manifestTrip?.days.length) {
    return fallbackDays;
  }

  return manifestTrip.days.map((day) => ({
    day: day.day,
    title: `${day.day} GPS 기반 일정`,
    places:
      day.placeGroups?.map((_, index) => `장소 ${index + 1}`) ?? day.places,
    note: `GPS 사진을 가까운 위치끼리 묶어 대표 장소 ${day.placeGroups?.length ?? day.places.length}곳으로 정리했습니다.`,
    placeGroups: day.placeGroups,
  }));
}

export const trips: Trip[] = [
  {
    id: "fukuoka-nagasaki-yufuin-2026-08",
    title: "후쿠오카 · 나가사키 · 유후인 여행",
    year: "2026",
    dates: "2026.08.08 - 2026.08.15",
    cities: ["Fukuoka", "Nagasaki", "Yufuin"],
    mood: "강변의 밤, 항구의 여름, 산과 호수를 걷던 8일",
    cover: "/photos/fukuoka-nagasaki-yufuin-2026-08/1000038235.jpg",
    summary: "후쿠오카의 여름밤에서 나가사키의 항구를 지나 유후인의 산과 호수까지. 사진 속 장면과 촬영 시각으로 다시 펼치는 규슈 여행.",
    highlights: ["후쿠오카의 여름밤", "나가사키 항구", "유후인의 산과 호수"],
    route: ["Fukuoka", "Nagasaki", "Yufuin", "Fukuoka"],
    photoCount: 72,
    locationNote: "전달된 사진에 유효한 GPS가 없어 촬영 날짜와 사진 속 장면으로 정리했습니다. 지역 구분은 사진과 여행 정보에 따른 추정입니다.",
    days: [
      { day: "2026.08.08", title: "후쿠오카 강변의 밤", places: ["후쿠오카"], note: "강물에 비친 네온과 포장마차, 늦은 밤의 거리에서 시작한 여행." },
      { day: "2026.08.09", title: "항구와 수족관", places: ["후쿠오카"], note: "도시와 항구를 걷고, 푸른 수조와 돌고래의 움직임을 사진에 담은 날." },
      { day: "2026.08.10", title: "신사와 바다, 여름 축제", places: ["후쿠오카", "다자이후 부근"], note: "숲속 도리이와 신사, 해변과 호수, 저녁의 등불까지 이어진 장면들." },
      { day: "2026.08.11", title: "나가사키 항구와 시내", places: ["나가사키"], note: "정박한 범선과 옛 거리, 노면전차의 길을 지나 항구와 차이나타운의 밤으로." },
      { day: "2026.08.12", title: "정원 너머 펼쳐진 나가사키", places: ["나가사키"], note: "언덕에서 내려다본 항구와 정원의 꽃, 카스텔라 한 조각과 공원의 산책길." },
      { day: "2026.08.13", title: "유후인의 들판과 작은 축제", places: ["유후인 부근"], note: "안개 낀 산 아래 들판과 저녁 축제. 이날 남은 두 장의 여행 풍경." },
      { day: "2026.08.14", title: "유후인 산책, 다시 후쿠오카의 밤", places: ["유후인", "후쿠오카"], note: "산이 보이는 개울과 호숫가, 꽃이 있는 골목을 걷고 다시 도시의 불빛 속으로." },
      { day: "2026.08.15", title: "아직 잠들지 않은 강변", places: ["후쿠오카"], note: "자정이 지난 거리와 강변에 남긴 이번 여행의 마지막 사진들." },
    ],
    photos: makePhotos("fukuoka-nagasaki-yufuin-2026-08", "규슈의 여름"),
  },
  {
    id: "kyoto-nara-2025-02",
    title: "교토 나라 여행",
    year: "2025",
    dates: "2025.02.08 - 2025.02.11",
    cities: ["Kyoto", "Nara"],
    mood: "고즈넉한 골목, 사슴공원, 오래 걷는 일정",
    cover: "/photos/kyoto-nara-2025-02/cover.jpg",
    summary:
      "2025년 첫 일본 여행 기록. 교토와 나라를 오가며 골목, 사찰, 공원 사진을 많이 남긴 여행.",
    highlights: ["교토 골목", "나라공원", "사찰 산책"],
    route: ["Kansai Airport", "Kyoto", "Nara", "Kyoto"],
    photoCount: 1112,
    days: makeDays("kyoto-nara-2025-02", [
      {
        day: "Day 1",
        title: "간사이 도착과 교토 이동",
        places: ["Kansai Airport", "Kyoto"],
        note: "도착 후 교토로 이동하며 여행의 첫 장면들을 남긴 날.",
      },
      {
        day: "Day 2-4",
        title: "교토와 나라를 오가는 일정",
        places: ["Kyoto", "Nara"],
        note: "교토의 골목과 나라의 공원을 중심으로 사진을 정리하면 좋은 구간.",
      },
    ]),
    photos: makePhotos("kyoto-nara-2025-02", "교토 나라 여행"),
  },
  {
    id: "nagoya-shizuoka-2025-04",
    title: "나고야 시즈오카 여행",
    year: "2025",
    dates: "2025.04.12 - 2025.04.15",
    cities: ["Nagoya", "Shizuoka"],
    mood: "도시 이동, 후지산 쪽 풍경, 봄 여행",
    cover: "/photos/nagoya-shizuoka-2025-04/cover.jpg",
    summary:
      "나고야와 시즈오카를 함께 묶은 봄 여행. 도시의 결이 달라서 이동 자체가 기억에 남는 기록.",
    highlights: ["나고야 시내", "시즈오카 풍경", "전철 이동"],
    route: ["Nagoya", "Shizuoka", "Nagoya"],
    photoCount: 807,
    days: makeDays("nagoya-shizuoka-2025-04", [
      {
        day: "Day 1",
        title: "나고야 도착",
        places: ["Nagoya"],
        note: "도시 첫인상과 숙소 주변을 정리하기 좋은 날.",
      },
      {
        day: "Day 2-4",
        title: "시즈오카 이동과 산책",
        places: ["Shizuoka", "Nagoya"],
        note: "시즈오카 쪽 풍경과 이동 경로 사진을 묶어두면 좋은 일정.",
      },
    ]),
    photos: makePhotos("nagoya-shizuoka-2025-04", "나고야 시즈오카 여행"),
  },
  {
    id: "sapporo-2025-08",
    title: "삿포로 여행",
    year: "2025",
    dates: "2025.08.25 - 2025.08.28",
    cities: ["Sapporo"],
    mood: "여름 홋카이도, 넓은 거리, 느긋한 공기",
    cover: "/photos/sapporo-2025-08/cover.jpg",
    summary:
      "여름의 삿포로를 걸었던 여행. 계절감과 거리 풍경을 중심으로 다시 꺼내보기 좋은 기록.",
    highlights: ["삿포로 거리", "여름 풍경", "음식 기록"],
    route: ["Sapporo"],
    photoCount: 341,
    days: makeDays("sapporo-2025-08", [
      {
        day: "Day 1",
        title: "삿포로 도착",
        places: ["Sapporo"],
        note: "도착 직후 도시 분위기와 첫 식사를 남긴 날.",
      },
      {
        day: "Day 2-4",
        title: "삿포로 시내 산책",
        places: ["Sapporo"],
        note: "여름 홋카이도의 거리와 음식을 한 묶음으로 정리하기 좋은 일정.",
      },
    ]),
    photos: makePhotos("sapporo-2025-08", "삿포로 여행"),
  },
  {
    id: "hakodate-2025-10",
    title: "하코다테 여행",
    year: "2025",
    dates: "2025.10.18 - 2025.10.21",
    cities: ["Hakodate"],
    mood: "항구 도시, 야경, 가을 공기",
    cover: "/photos/hakodate-2025-10/cover.jpg",
    summary:
      "가을의 하코다테 여행. 항구 도시의 풍경과 야경을 중심으로 사진이 많이 남은 기록.",
    highlights: ["하코다테 야경", "항구 산책", "가을 거리"],
    route: ["Hakodate"],
    photoCount: 587,
    days: makeDays("hakodate-2025-10", [
      {
        day: "Day 1",
        title: "하코다테 도착",
        places: ["Hakodate"],
        note: "도착 후 주변 거리와 첫 풍경을 정리하기 좋은 날.",
      },
      {
        day: "Day 2-4",
        title: "항구와 야경",
        places: ["Hakodate"],
        note: "항구 도시 특유의 분위기와 밤 풍경을 중심으로 기억을 묶어두는 일정.",
      },
    ]),
    photos: makePhotos("hakodate-2025-10", "하코다테 여행"),
  },
  {
    id: "hiroshima-2025-12",
    title: "히로시마 여행",
    year: "2025",
    dates: "2025.12.13 - 2025.12.16",
    cities: ["Hiroshima"],
    mood: "겨울 도시, 차분한 동선, 연말 여행",
    cover: "/photos/hiroshima-2025-12/cover.jpg",
    summary:
      "2025년 마지막 일본 여행 기록. 차분한 겨울 분위기와 도시의 장면을 모아둔 여행.",
    highlights: ["히로시마 시내", "겨울 산책", "연말 기록"],
    route: ["Hiroshima"],
    photoCount: 282,
    days: makeDays("hiroshima-2025-12", [
      {
        day: "Day 1",
        title: "히로시마 도착",
        places: ["Hiroshima"],
        note: "겨울 도시의 첫인상과 이동 경로를 정리하기 좋은 날.",
      },
      {
        day: "Day 2-4",
        title: "히로시마 시내 기록",
        places: ["Hiroshima"],
        note: "도시 산책과 연말 분위기를 사진으로 묶어두는 일정.",
      },
    ]),
    photos: makePhotos("hiroshima-2025-12", "히로시마 여행"),
  },
  {
    id: "kitakyushu-2026-03",
    title: "기타큐슈 여행",
    year: "2026",
    dates: "2026.03.14 - 2026.03.16",
    cities: ["Kitakyushu"],
    mood: "짧은 일정, 항구와 골목, 봄 초입",
    cover: "/photos/kitakyushu-2026-03/cover.jpg",
    summary:
      "2026년 봄 초입에 다녀온 기타큐슈 여행. 짧지만 사진 밀도가 높은 기록.",
    highlights: ["기타큐슈 거리", "짧은 산책", "봄 여행"],
    route: ["Kitakyushu"],
    photoCount: 205,
    days: makeDays("kitakyushu-2026-03", [
      {
        day: "Day 1",
        title: "기타큐슈 도착",
        places: ["Kitakyushu"],
        note: "짧은 일정의 시작. 첫날 사진과 이동 기록을 정리하기 좋은 구간.",
      },
      {
        day: "Day 2-3",
        title: "기타큐슈 산책",
        places: ["Kitakyushu"],
        note: "도시의 골목과 항구 쪽 분위기를 중심으로 묶어두면 좋은 일정.",
      },
    ]),
    photos: makePhotos("kitakyushu-2026-03", "기타큐슈 여행"),
  },
  {
    id: "kagoshima-2026-05",
    title: "가고시마 여행",
    year: "2026",
    dates: "2026.05.15 - 2026.05.18",
    cities: ["Kagoshima"],
    mood: "남쪽 도시, 초여름, 느긋한 여행",
    cover: "/photos/kagoshima-2026-05/places/20260516-02.jpg",
    summary:
      "2026년 5월의 가고시마 여행. 초여름 공기와 남쪽 도시의 장면을 모아둔 기록.",
    highlights: ["가고시마 거리", "초여름 풍경", "도시 산책"],
    route: ["Kagoshima"],
    photoCount: 243,
    days: makeDays("kagoshima-2026-05", [
      {
        day: "Day 1",
        title: "가고시마 도착",
        places: ["Kagoshima"],
        note: "도착 직후의 공기와 첫 장면을 남긴 날.",
      },
      {
        day: "Day 2-4",
        title: "가고시마 시내와 주변 산책",
        places: ["Kagoshima"],
        note: "초여름 남쪽 도시의 분위기를 사진으로 정리하기 좋은 일정.",
      },
    ]),
    photos: makePhotos("kagoshima-2026-05", "가고시마 여행"),
  },
];

export const travelStats = {
  totalTrips: 8,
  archivedTrips: trips.length,
  lastYearTrips: 5,
  thisYearTrips: 3,
  visitedCities: Array.from(new Set(trips.flatMap((trip) => trip.cities))).length,
};
