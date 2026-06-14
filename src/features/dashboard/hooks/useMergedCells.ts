import { useMemo } from "react";
import type { NineBoxResponse, MergedKey, NineBoxCell } from "@/entities/dashboard";
import { sumCells } from "../utils/sumCells";

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
 * Результат мемоизирован — пересчитывается только при изменении nineBox.
 */
export function useMergedCells(nineBox: NineBoxResponse | undefined): MergedCells | null {
  return useMemo(() => {
    if (!nineBox) return null;

    return {
      AD_AE: sumCells(nineBox.cells, MERGE_RULES.AD_AE),
      AC:    sumCells(nineBox.cells, MERGE_RULES.AC),
      AA_AB: sumCells(nineBox.cells, MERGE_RULES.AA_AB),
      BD_BE: sumCells(nineBox.cells, MERGE_RULES.BD_BE),
      BC:    sumCells(nineBox.cells, MERGE_RULES.BC),
      BA_BB: sumCells(nineBox.cells, MERGE_RULES.BA_BB),
      CD_CE: sumCells(nineBox.cells, MERGE_RULES.CD_CE),
      CB_CC: sumCells(nineBox.cells, MERGE_RULES.CB_CC),
      CA:    sumCells(nineBox.cells, MERGE_RULES.CA),
    };
  }, [nineBox]);
}
