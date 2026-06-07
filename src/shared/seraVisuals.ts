export const SERA_IMAGES = {
  table: "/sera/mediterranean-table.png",
};

export const SERA_EDITORIAL_IMAGE_POSITIONS = [
  "50% 45%",
  "42% 50%",
  "58% 42%",
  "46% 58%",
  "62% 52%",
  "38% 46%",
  "54% 60%",
];

const DAY_IMAGE_INDEX: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

export function getSeraMealImageUrl(imageUrl?: string) {
  return imageUrl || SERA_IMAGES.table;
}

export function getSeraMealImagePosition(day?: string) {
  return SERA_EDITORIAL_IMAGE_POSITIONS[DAY_IMAGE_INDEX[day || ""] ?? 0];
}
