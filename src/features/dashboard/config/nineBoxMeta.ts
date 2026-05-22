import type { MergedKey, MergedCellMeta } from "../../../types/dashboard";

/** Метаданные объединённых ячеек 9-box (лейбл + описание) */
export const boxMeta = {
  AD_AE: { label: "Низкоэффективный", description: "Требуется развитие экспертизы" },
  AC:    { label: "Профессионал", description: "Возможен карьерный рост и развитие экспертизы" },
  AA_AB: { label: "Звезда", description: "Требуется продвижение" },

  BD_BE: { label: "Низкоэффективный", description: "Требуется ротация или смена деятельности" },
  BC:    { label: "Профессионал", description: "Возможен карьерный рост с наставником и развитие экспертизы" },
  BA_BB: { label: "Эксперт", description: "Возможен карьерный рост" },

  CD_CE: { label: "Зона риска", description: "Низкие результаты и потенциал" },
  CB_CC: { label: "Профессионал", description: "Требуется развитие потенциала" },
  CA:    { label: "Эксперт", description: "Требуется развитие потенциала" },
} as const satisfies Record<MergedKey, MergedCellMeta>;

/** Цвета фона для каждой объединённой ячейки */
export const categoryColor = {
  AD_AE: "#ff953f", // оранжевый
  AC:    "#2f9d76",
  AA_AB: "#2f9d76", // зелёный

  BD_BE: "#ee5d48",
  BC:    "#ff953f",
  BA_BB: "#2f9d76",

  CD_CE: "#ee5d48", // красный
  CB_CC: "#ee5d48",
  CA:    "#ff953f",
} as const satisfies Record<MergedKey, string>;

/** Порядок ячеек для рендеринга матрицы 3×3 */
export const rowsOrder: MergedKey[][] = [
  ["AD_AE", "AC", "AA_AB"], // потенциал A
  ["BD_BE", "BC", "BA_BB"], // потенциал B
  ["CD_CE", "CB_CC", "CA"], // потенциал C
];

/** Подписи строк (потенциал) */
export const potentialLabels = ["A (высокий)", "B (средний)", "C (низкий)"] as const;

/** Подписи столбцов (результативность) */
export const performanceLabels = ["D / E", "C", "A / B"] as const;
