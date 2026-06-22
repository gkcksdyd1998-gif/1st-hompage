# 일본여행기 프로젝트 노트

## 목표

일본 여행 사진, 이동 경로, 도시별 기억을 정리해서 GitHub와 Vercel로 공개할 수 있는 개인 여행 아카이브 사이트를 만든다.

## 현재 구조

- `src/app/page.tsx`: 메인 화면
- `src/data/trips.ts`: 여행 데이터
- `public/photos/`: 여행 사진 폴더

## 사진 추가 방법

1. `public/photos/여행-id/` 폴더를 만든다.
2. 대표 사진을 `cover.png` 또는 `cover.jpg`로 넣는다.
3. `src/data/trips.ts`의 `cover` 값을 `/photos/여행-id/cover.png`처럼 맞춘다.

## 다음에 만들기 좋은 기능

- 여행 상세 페이지
- 날짜별 일정 타임라인
- 사진 갤러리
- 지도 기반 방문 도시 표시
- GitHub 저장소 연결
- Vercel 배포
