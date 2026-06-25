import type { NineBoxCell } from "@/entities/dashboard";

/**
 * Суммирует ячейки nineBox по заданным ключам.
 * Возвращает объединённую ячейку с суммой managers, successors и nonSuccessors.
 */
export function sumCells(
  cells: Record<string, NineBoxCell>,
  keys: readonly string[]
): NineBoxCell {
  let managers = 0;
  let successors = 0;
  let nonSuccessors = 0;

  keys.forEach((key) => {
    const cell = cells[key];
    if (cell) {
      managers += cell.managers;
      successors += cell.successors;
      nonSuccessors += cell.nonSuccessors;
    }
  });

  return { managers, successors, nonSuccessors };
}
