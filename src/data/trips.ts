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
  },
];

export const travelStats = {
  totalTrips: 8,
  lastYearTrips: 5,
  thisYearTrips: 3,
  visitedCities: Array.from(new Set(trips.flatMap((trip) => trip.cities))).length,
};
