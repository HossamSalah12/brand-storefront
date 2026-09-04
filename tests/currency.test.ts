import { describe, expect, it } from "vitest";
import { formatPrice } from "@/lib/utils/currency";

describe("formatPrice", () => {
  it("formats whole numbers with the currency suffix", () => {
    expect(formatPrice(750)).toBe("750 ج.م");
  });

  it("adds thousands separators for large numbers", () => {
    expect(formatPrice(12500)).toBe("12,500 ج.م");
  });

  it("formats zero correctly", () => {
    expect(formatPrice(0)).toBe("0 ج.م");
  });
});
