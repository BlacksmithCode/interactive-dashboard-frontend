import * as mockAdapter from "../adapters/mockAdapter";
import * as httpAdapter from "../adapters/httpAdapter";
import type { DashboardFilters, StatsResponse, NineBoxResponse } from "../../types/dashboard";

/** Переключение mock/real через переменную окружения VITE_USE_MOCK */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const fetchStats: (params: DashboardFilters) => Promise<StatsResponse> =
  USE_MOCK ? mockAdapter.fetchStats : httpAdapter.fetchStats;

export const fetchNineBox: (params: DashboardFilters) => Promise<NineBoxResponse> =
  USE_MOCK ? mockAdapter.fetchNineBox : httpAdapter.fetchNineBox;
