export const CHEST_EASE_CM = 6;

export type SizeMeasurementRow = {
  sizeId: string;
  sizeName: string;
  chestCm: number | null;
  shoulderCm: number | null;
};

export function recommendSize(
  rows: SizeMeasurementRow[],
  input: { chestCm?: number | null; shoulderCm?: number | null },
): string | null {
  const chestVal = input.chestCm ?? null;
  const shoulderVal = input.shoulderCm ?? null;

  if (!chestVal && !shoulderVal) return null;

  let best: SizeMeasurementRow | null = null;
  let bestScore = Infinity;

  for (const row of rows) {
    let score = 0;
    let count = 0;
    if (chestVal && row.chestCm != null) {
      score += Math.abs(row.chestCm - (chestVal + CHEST_EASE_CM));
      count++;
    }
    if (shoulderVal && row.shoulderCm != null) {
      score += Math.abs(row.shoulderCm - shoulderVal);
      count++;
    }
    if (count === 0) continue;
    score /= count;
    if (score < bestScore) {
      bestScore = score;
      best = row;
    }
  }

  return best?.sizeName ?? null;
}
