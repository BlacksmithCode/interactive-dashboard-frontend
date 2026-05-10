import type { DashboardFilters, StatsResponse, NineBoxResponse } from "../../types/dashboard";

// Имитация задержки сети
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const mockStats: StatsResponse = {
  managersWithSuccessors: 45,
  managersWithoutSuccessors: 12,
  criticalRoles: 28,
  criticalRolesWithSuccessors: 18,
  criticalRolesWithoutSuccessors: 10,
  nonCriticalRoles: 29,
  nonCriticalRolesWithSuccessors: 27,
  nonCriticalRolesWithoutSuccessors: 2,
};

const mockNineBox: NineBoxResponse = {
  totalManagers: 125,
  cells: {
    AA: { managers: 12, successors: 18, nonSuccessors: 0 },
    AB: { managers: 8, successors: 11, nonSuccessors: 0 },
    AC: { managers: 5, successors: 7, nonSuccessors: 0 },
    AD: { managers: 2, successors: 3, nonSuccessors: 0 },
    AE: { managers: 1, successors: 2, nonSuccessors: 0 },
    BA: { managers: 15, successors: 22, nonSuccessors: 0 },
    BB: { managers: 20, successors: 30, nonSuccessors: 0 },
    BC: { managers: 10, successors: 14, nonSuccessors: 0 },
    BD: { managers: 4, successors: 8, nonSuccessors: 0 },
    BE: { managers: 2, successors: 3, nonSuccessors: 0 },
    CA: { managers: 8, successors: 12, nonSuccessors: 0 },
    CB: { managers: 6, successors: 9, nonSuccessors: 0 },
    CC: { managers: 4, successors: 6, nonSuccessors: 0 },
    CD: { managers: 1, successors: 2, nonSuccessors: 0 },
    CE: { managers: 0, successors: 0, nonSuccessors: 0 },
  },
};

export async function fetchStats(_params: DashboardFilters): Promise<StatsResponse> {
  void _params;
  await delay(200);
  return mockStats;
}

export async function fetchNineBox(_params: DashboardFilters): Promise<NineBoxResponse> {
  void _params;
  await delay(200);
  return mockNineBox;
}

// ---------- Дашборд 2: руководители и преемники ----------
import type { LeaderSummary, LeaderDetails } from "../../types/dashboard";

const mockLeaders: LeaderSummary[] = [
  { id: 1, fullName: "Иванов Иван Иванович", position: "Директор департамента", grade: 21, domain: "Иннотех" },
  { id: 2, fullName: "Петров Пётр Петрович", position: "Руководитель отдела", grade: 19, domain: "Код" },
  { id: 3, fullName: "Сидорова Анна Сергеевна", position: "Team Lead", grade: 18, domain: "Искусственный интеллект" },
];

const mockTeam: Record<number, LeaderDetails> = {
  1: {
    leader: mockLeaders[0],
    team: [
      { fullName: "Смирнов Алексей", position: "Разработчик", potential: "B", potentialValue: 75, performance: "B", performanceValue: 80, box: "BB", boxInterpretation: "Эксперт", evaluationYear: 2024 },
      { fullName: "Кузнецова Мария", position: "Аналитик", potential: "A", potentialValue: 90, performance: "A", performanceValue: 95, box: "AA", boxInterpretation: "Звезда", evaluationYear: 2024 },
    ],
    successors: [
      { fullName: "Кузнецова Мария", position: "Аналитик", potential: "A", potentialValue: 90, performance: "A", performanceValue: 95, box: "AA", boxInterpretation: "Звезда", evaluationYear: 2024, declaredBy: "Иванов И.И.", declarationDate: "2024-12-01" },
    ],
  },
  2: {
    leader: mockLeaders[1],
    team: [
      { fullName: "Волков Дмитрий", position: "Инженер", potential: "C", potentialValue: 50, performance: "C", performanceValue: 60, box: "CC", boxInterpretation: "Профессионал", evaluationYear: 2024 },
    ],
    successors: [],
  },
  3: {
    leader: mockLeaders[2],
    team: [],
    successors: [],
  },
};

export async function fetchLeaders(search?: string): Promise<LeaderSummary[]> {
  await delay(200);
  if (!search) return mockLeaders;
  const lower = search.toLowerCase();
  return mockLeaders.filter(
    (l) => l.fullName.toLowerCase().includes(lower) || l.position.toLowerCase().includes(lower)
  );
}

export async function fetchLeaderDetails(id: number): Promise<LeaderDetails> {
  await delay(300);
  const details = mockTeam[id];
  if (!details) throw new Error("Руководитель не найден");
  return details;
}