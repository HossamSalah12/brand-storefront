import { describe, expect, it } from "vitest";
import { recommendSize, type SizeMeasurementRow } from "@/lib/utils/sizeRecommendation";

const rows: SizeMeasurementRow[] = [
  { sizeId: "1", sizeName: "S", chestCm: 52, shoulderCm: 45 },
  { sizeId: "2", sizeName: "M", chestCm: 55, shoulderCm: 47 },
  { sizeId: "3", sizeName: "L", chestCm: 58, shoulderCm: 49 },
  { sizeId: "4", sizeName: "XL", chestCm: 61, shoulderCm: 51 },
];

describe("recommendSize", () => {
  it("returns null when neither chest nor shoulder is provided", () => {
    expect(recommendSize(rows, {})).toBeNull();
  });

  it("recommends the closest size by chest measurement (with ease allowance)", () => {
    // 49cm chest + 6cm ease = 55cm target -> matches M (55cm) exactly
    expect(recommendSize(rows, { chestCm: 49 })).toBe("M");
  });

  it("recommends a larger size for a bigger chest measurement", () => {
    expect(recommendSize(rows, { chestCm: 55 })).toBe("L");
  });

  it("falls back to shoulder measurement when chest isn't given", () => {
    expect(recommendSize(rows, { shoulderCm: 51 })).toBe("XL");
  });

  it("returns null when the measurement table is empty", () => {
    expect(recommendSize([], { chestCm: 50 })).toBeNull();
  });
});
