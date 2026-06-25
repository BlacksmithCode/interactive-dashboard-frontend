import { useMemo } from "react";
import type { NineBoxResponse, MergedKey, NineBoxCell } from "@/entities/dashboard";

/** Правила объединения: ключ MergedKey → массив исходных ключей NineBox */
export const MERGE_RULES: Record<MergedKey, readonly string[]> = {
  AD_AE: ["AD", "AE"],
  AC:    ["AC"],
  AA_AB: ["AA", "AB"],
  BD_BE: ["BD", "BE"],
  BC:    ["BC"],
  BA_BB: ["BA", "BB"],
  CD_CE: ["CD", "CE"],
  CB_CC: ["CB", "CC"],
  CA:    ["CA"],
};

export type MergedCells = Record<MergedKey, NineBoxCell>;

/**
 * Хук агрегации сырых ячеек 9-box в объединённые категории 3×3.
 * Бэкенд уже возвращает данные в merged-формате — просто приводим к типу.
 */
export function useMergedCells(nineBox: NineBoxResponse | undefined): MergedCells | null {
  return useMemo(() => {
    if (!nineBox) return null;
    return nineBox.cells as unknown as MergedCells;
  }, [nineBox]);
}
