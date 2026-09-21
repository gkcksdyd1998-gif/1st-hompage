import { test, expect } from "@playwright/test";

test("travel search, filters, and single-click navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".trip-card")).toHaveCount(8);
  await page.getByRole("button", { name: "2026", exact: true }).click();
  await expect(page.locator(".trip-card")).toHaveCount(3);
  await page.getByRole("button", { name: "전체", exact: true }).click();
  await page
    .getByRole("textbox", { name: "여행 및 장소 검색" })
    .fill("하코다테");
  await expect(page.locator(".trip-card")).toHaveCount(1);
  await page
    .getByRole("textbox", { name: "여행 및 장소 검색" })
    .fill("없는도시123");
  await expect(page.getByText("일치하는 여행이 없어요")).toBeVisible();
  await page
    .getByRole("button", { name: "전체 여행 보기", exact: true })
    .click();
  await expect(page.locator(".trip-card")).toHaveCount(8);
  await page.locator('.trip-card[href="/trips/kagoshima-2026-05"]').click();
  await expect(page).toHaveURL(/trips\/kagoshima/);
  await expect(page.locator(".leaflet-marker-icon")).not.toHaveCount(0);
});

test("day filters, map selection, photo viewer and keyboard focus", async ({
  page,
}) => {
  await page.goto("/trips/kagoshima-2026-05");
  await page.getByRole("button", { name: "DAY 1 05/15" }).click();
  await expect(page.getByText("이날은 위치 기록이 없어요")).toBeVisible();
  await page.getByRole("button", { name: "DAY 2 05/16" }).click();
  await expect(page.locator(".place-row")).toHaveCount(5);
  await expect(page.locator(".leaflet-marker-icon")).not.toHaveCount(0);
  await page.locator(".place-rail button").nth(1).click();
  await expect(page.locator(".route-pin.selected")).toHaveCount(1);
  await page.locator(".route-pin.selected").click();
  await expect(page.locator(".place-row.is-active")).toHaveCount(1);
  const trigger = page.locator(".place-image").first();
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "다음 사진", exact: true }).click();
  await expect(page.locator(".viewer-top")).toContainText("2 /");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".viewer-top")).toContainText("1 /");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("Kyushu photo trip has eight dated itineraries without a false GPS map", async ({ page }) => {
  await page.goto("/trips/fukuoka-nagasaki-yufuin-2026-08");
  await expect(page.locator(".gallery-photo")).toHaveCount(72);
  await expect(page.locator(".day-tabs button")).toHaveCount(9);
  await expect(page.getByText(/유효한 GPS가 없어/)).toBeVisible();
  await page.getByRole("button", { name: "DAY 8 08/15" }).click();
  await expect(page.locator(".gallery-photo")).toHaveCount(2);
  await page.locator(".gallery-photo").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "여정", exact: true }).click();
  await expect(page.locator(".photo-day")).toHaveCount(1);
  await page.getByRole("button", { name: "전체 일정" }).click();
  await expect(page.locator(".photo-day")).toHaveCount(8);
  await expect(page.locator(".leaflet-container")).toHaveCount(0);
});

for (const width of [390, 1440]) {
  test(`responsive layout and loaded images at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 950 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const path of ["/", "/trips/kagoshima-2026-05", "/trips/fukuoka-nagasaki-yufuin-2026-08"]) {
      await page.goto(path);
      await page.locator(".featured img, .trip-panorama img").waitFor();
      await expect
        .poll(() =>
          page
            .locator(".featured img, .trip-panorama img")
            .evaluate(
              (image: HTMLImageElement) =>
                image.complete && image.naturalWidth > 0,
            ),
        )
        .toBe(true);
      if (path.includes("kagoshima")) {
        await expect(page.locator(".leaflet-marker-icon")).not.toHaveCount(0);
        await page.locator(".map-heading").scrollIntoViewIfNeeded();
        await expect
          .poll(() => page.locator(".leaflet-tile-loaded").count())
          .toBeGreaterThan(0);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `test-results/${path === "/" ? "home" : path.includes("kagoshima") ? "trip" : "kyushu"}-${width}.png`,
        fullPage: false,
      });
    }
    expect(errors).toEqual([]);
  });
}
