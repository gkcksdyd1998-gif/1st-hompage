# 일본여행기 프로젝트 노트

## 목표

일본 여행 사진, 이동 경로, 도시별 기억을 정리해서 GitHub와 Vercel로 공개할 수 있는 개인 여행 아카이브 사이트를 만든다.

## 현재 구조

- `src/app/page.tsx`: 메인 화면
- `src/data/trips.ts`: 여행 데이터
- `public/photos/`: 여행 사진 폴더

## 사진 추가 방법

1. 네이버 클라우드 등에서 사진을 zip으로 내려받는다.
2. 아래 명령으로 웹용 사진을 자동 추출한다.

```powershell
powershell.exe -ExecutionPolicy Bypass -File scripts\import-travel-photos.ps1 -ZipPath "C:\Users\82102\Downloads\일본여행.zip" -PhotosPerTrip 12 -MaxWidth 1600
```

3. `src/data/trips.ts`에서 여행 제목, 요약, 일정 메모를 다듬는다.
4. 사진 안에 GPS EXIF가 남아 있으면 상세 페이지에 좌표와 지도 링크가 표시된다.
5. GPS 사진 전체를 날짜와 가까운 좌표 기준으로 묶어 대표 장소 사진과 자동 일정을 만든다.
6. 아래 명령으로 대표 장소 좌표에 주변 장소명을 붙인다.

```powershell
node scripts\enrich-place-names.mjs
```

7. 공개 사이트에 올려도 되는 얼굴 사진인지 확인한다.

## 다음에 만들기 좋은 기능

- 여행 상세 페이지
- 날짜별 일정 타임라인
- 사진 갤러리
- 지도 기반 방문 도시 표시
- GitHub 저장소 연결
- Vercel 배포
