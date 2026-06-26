/** Порядок значений BOX: AA → AB → AC → AD → AE → BA → BB → ... → CE */
const BOX_ORDER = [
  "AA", "AB", "AC", "AD", "AE",
  "BA", "BB", "BC", "BD", "BE",
  "CA", "CB", "CC", "CD", "CE",
];

/** Порядок интерпретаций: зелёные → оранжевые → красные */
const INTERPRETATION_GROUPS: { label: string; color: number; rank: number }[] = [
  { label: "Звезда", color: 0, rank: 0 },
  { label: "Эксперт", color: 0, rank: 1 },
  { label: "Профессионал", color: 0, rank: 2 },
  { label: "Профессионал", color: 1, rank: 0 },
  { label: "Эксперт", color: 1, rank: 1 },
  { label: "Низкоэффективный", color: 1, rank: 2 },
  { label: "Профессионал", color: 2, rank: 0 },
  { label: "Низкоэффективный", color: 2, rank: 1 },
  { label: "Зона риска", color: 2, rank: 2 },
];

const INTERPRETATION_MAP = new Map(INTERPRETATION_GROUPS.map(g => [g.label, g]));

export function compareBox(a: string | undefined, b: string | undefined): number {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;

  const idxA = BOX_ORDER.indexOf(a);
  const idxB = BOX_ORDER.indexOf(b);

  if (idxA === -1 && idxB === -1) return a.localeCompare(b);
  if (idxA === -1) return 1;
  if (idxB === -1) return -1;

  return idxA - idxB;
}

export function compareBoxInterpretation(a: string | undefined, b: string | undefined): number {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;

  const groupA = INTERPRETATION_MAP.get(a);
  const groupB = INTERPRETATION_MAP.get(b);

  if (groupA && groupB) {
    if (groupA.color !== groupB.color) return groupA.color - groupB.color;
    return groupA.rank - groupB.rank;
  }
  
  if (groupA) return -1;
  if (groupB) return 1;
  
  return a.localeCompare(b);
}

