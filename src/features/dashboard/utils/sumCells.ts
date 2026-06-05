import type { NineBoxCell } from "../../../shared/types/dashboard";

/**
 * Суммирует значения нескольких ячеек 9-box по списку ключей.
 * Используется для агрегации пар ячеек в объединённую категорию 3×3.
 */
export function sumCells(
  cells: Record<string, NineBoxCell>,
  keys: readonly string[],
): NineBoxCell {
  let managers = 0;
  let successors = 0;
  let nonSuccessors = 0;

  for (const key of keys) {
    const cell = cells[key];
    if (cell) {
      managers += cell.managers;
      successors += cell.successors;
      nonSuccessors += cell.nonSuccessors;
    }
  }

  return { managers, successors, nonSuccessors };
}
