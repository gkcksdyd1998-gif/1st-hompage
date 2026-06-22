export type TripDay = {
  day: string;
  title: string;
  places: string[];
  note: string;
};

export type TripPhoto = {
  src: string;
  alt: string;
  caption: string;
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
  days: TripDay[];
  photos: TripPhoto[];
};

export const trips: Trip[] = [
  {
    id: "tokyo-winter",
    title: "도쿄 겨울 산책",
    year: "2025",
    dates: "2025.01",
    cities: ["Tokyo", "Yokohama"],
    mood: "차가운 공기, 밤거리, 편의점 커피",
    cover: "/photos/tokyo-winter/cover.png",
    summary:
      "작년 첫 일본 여행. 낮에는 골목을 걷고 밤에는 네온이 켜지는 시간을 기다리며 사진을 많이 남긴 여행.",
    highlights: ["시부야 야경", "요코하마 항구", "아침 카페"],
    route: ["Incheon", "Narita", "Shibuya", "Yokohama", "Ueno"],
    photoCount: 84,
    days: [
      {
        day: "Day 1",
        title: "도착과 시부야 밤 산책",
        places: ["Narita", "Shibuya", "Omotesando"],
        note: "숙소에 짐을 두고 바로 밤거리로 나간 날. 네온과 횡단보도 사진을 중심으로 남겼다.",
      },
      {
        day: "Day 2",
        title: "요코하마까지 천천히 이동",
        places: ["Yokohama", "Minato Mirai", "Ueno"],
        note: "항구 쪽 공기와 저녁 풍경이 좋았던 날. 이동 경로가 길어서 전철 기록도 남기기 좋았다.",
      },
    ],
    photos: [
      {
        src: "/photos/tokyo-winter/cover.png",
        alt: "도쿄 겨울 여행 대표 이미지",
        caption: "도쿄 여행 대표 컷",
      },
    ],
  },
  {
    id: "osaka-food",
    title: "오사카 먹고 걷기",
    year: "2025",
    dates: "2025.04",
    cities: ["Osaka", "Kyoto", "Nara"],
    mood: "골목 음식, 전철 소리, 늦은 밤 숙소로 돌아가는 길",
    cover: "/photos/osaka-food/cover.png",
    summary:
      "음식과 동선이 중심이었던 여행. 하루마다 지역을 바꾸며 사진과 메모를 촘촘히 남기기 시작했다.",
    highlights: ["도톤보리", "교토 골목", "나라공원"],
    route: ["Kansai Airport", "Namba", "Kyoto", "Nara", "Umeda"],
    photoCount: 126,
    days: [
      {
        day: "Day 1",
        title: "난바와 도톤보리",
        places: ["Kansai Airport", "Namba", "Dotonbori"],
        note: "도착하자마자 먹는 일정으로 시작. 간판, 골목, 음식 사진이 많이 남은 날.",
      },
      {
        day: "Day 2",
        title: "교토 골목 산책",
        places: ["Kyoto", "Gion", "Kamo River"],
        note: "오사카와 전혀 다른 분위기. 다음에는 계절을 바꿔서 다시 찍어보고 싶은 곳.",
      },
    ],
    photos: [
      {
        src: "/photos/osaka-food/cover.png",
        alt: "오사카 여행 대표 이미지",
        caption: "오사카 여행 대표 컷",
      },
    ],
  },
  {
    id: "fukuoka-spring",
    title: "후쿠오카 짧은 봄",
    year: "2026",
    dates: "2026.03",
    cities: ["Fukuoka", "Dazaifu"],
    mood: "가까운 거리, 느린 일정, 다시 가고 싶은 동네",
    cover: "/photos/fukuoka-spring/cover.png",
    summary:
      "올해 다녀온 여행 중 하나. 오래 걷기보다 머무는 시간이 좋았고, 다음 여행의 기준을 바꿔준 기록.",
    highlights: ["오호리공원", "다자이후", "야타이 거리"],
    route: ["Busan", "Fukuoka", "Ohori Park", "Dazaifu", "Hakata"],
    photoCount: 73,
    days: [
      {
        day: "Day 1",
        title: "하카타와 오호리공원",
        places: ["Hakata", "Ohori Park", "Tenjin"],
        note: "빡빡하게 움직이기보다 천천히 머물렀던 날. 공원과 카페 사진을 중심으로 정리하면 좋다.",
      },
      {
        day: "Day 2",
        title: "다자이후 반나절",
        places: ["Dazaifu", "Hakata"],
        note: "짧지만 기억에 오래 남는 코스. 기념품, 골목, 간식 사진을 한 묶음으로 두기 좋다.",
      },
    ],
    photos: [
      {
        src: "/photos/fukuoka-spring/cover.png",
        alt: "후쿠오카 여행 대표 이미지",
        caption: "후쿠오카 여행 대표 컷",
      },
    ],
  },
];

export const travelStats = {
  totalTrips: 8,
  lastYearTrips: 5,
  thisYearTrips: 3,
  visitedCities: Array.from(new Set(trips.flatMap((trip) => trip.cities))).length,
};
