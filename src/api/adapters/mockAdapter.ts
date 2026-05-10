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
