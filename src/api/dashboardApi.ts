import axios from "axios";

// ----- ВРЕМЕННЫЕ ЗАГЛУШКИ (MOCK) -----
const USE_MOCK = true; // переключите на false, когда появится бэкенд

const mockStats = {
  managersWithSuccessors: 45,
  managersWithoutSuccessors: 12,
  criticalRoles: 28,
  criticalRolesWithSuccessors: 18,
  criticalRolesWithoutSuccessors: 10,
  nonCriticalRoles: 29,
  nonCriticalRolesWithSuccessors: 27,
  nonCriticalRolesWithoutSuccessors: 2,
};

const mockNineBox = {
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

// Имитация задержки сети (200 мс)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Типы такие же, как раньше
export interface StatsResponse {
  managersWithSuccessors: number;
  managersWithoutSuccessors: number;
  criticalRoles: number;
  criticalRolesWithSuccessors: number;
  criticalRolesWithoutSuccessors: number;
  nonCriticalRoles: number;
  nonCriticalRolesWithSuccessors: number;
  nonCriticalRolesWithoutSuccessors: number;
}

export interface NineBoxCell {
  managers: number;
  successors: number;
  nonSuccessors: number;
}

export interface NineBoxResponse {
  totalManagers: number;
  cells: Record<string, NineBoxCell>;
}

// API-клиент
const api = axios.create({
  baseURL: "/api/dashboard",
});

// Запрос stats
export async function fetchStats(params: {
  gradeMin?: number;
  domain?: string;
}) {
  if (USE_MOCK) {
    await delay(200);
    return mockStats;
  }
  const { data } = await api.get<StatsResponse>("/stats", { params });
  return data;
}

// Запрос 9box
export async function fetchNineBox(params: {
  gradeMin?: number;
  domain?: string;
}) {
  if (USE_MOCK) {
    await delay(200);
    return mockNineBox;
  }
  const { data } = await api.get<NineBoxResponse>("/9box", { params });
  return data;
}