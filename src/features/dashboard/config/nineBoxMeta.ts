import type { MergedKey, MergedCellMeta } from "@/entities/dashboard";
import { colors } from "@/shared/theme/tokens";

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

/**
 * Цвета фона для каждой объединённой ячейки.
 * Используем палитру Т1: зелёный для "хорошо", оранжевый/красный для "тревожно".
 * В тёмной теме задаём более насыщенные оттенки, в светлой — пастельные.
 */
export const categoryColor = {
  AD_AE: colors.warning,         // оранжевый
  AC:    colors.success,         // зелёный
  AA_AB: colors.success,        // зелёный

  BD_BE: colors.error,          // красный
  BC:    colors.warning,        // оранжевый
  BA_BB: colors.success,        // зелёный

  CD_CE: colors.error,          // красный
  CB_CC: colors.error,          // красный
  CA:    colors.warning,        // оранжевый
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
export const performanceLabels = ["D / E (Сниженная-Низкая)", "B / C (Высокая-Нормальная)", "A / B (Высшая-Высокая)"] as const;

/** Расшифровка результативности */
export const PERF_MAP: Record<string, string> = {
  A: "Высшая",
  B: "Высокая",
  C: "Нормальная",
  D: "Сниженная",
  E: "Низкая",
};

/** Расшифровка потенциала */
export const POT_MAP: Record<string, string> = {
  A: "Высокий",
  B: "Средний",
  C: "Низкий",
};
