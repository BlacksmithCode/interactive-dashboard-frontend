import type { GridColDef } from "@mui/x-data-grid";
import type { ManagerListItem, Successor } from "@/entities/leader";
import { PERF_MAP, POT_MAP } from "@/features/dashboard";

// Колонки таблицы руководителей (главная таблица)
export const leaderColumns: GridColDef<ManagerListItem>[] = [
  { 
    field: "fullName", 
    headerName: "ФИО", 
    flex: 1, 
    minWidth: 160,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "grade", 
    headerName: "Грейд", 
    width: 80,
    valueGetter: (value) => (value !== undefined && value !== null) ? String(value) : "Нет данных"
  },
  { 
    field: "potential", 
    headerName: "Потенциал", 
    width: 140,
    valueGetter: (value) => {
      if (!value) return "Нет данных";
      return POT_MAP[value as string] ? `${value} (${POT_MAP[value as string]})` : value;
    }
  },
  { 
    field: "performance", 
    headerName: "Результативность", 
    width: 160,
    valueGetter: (value) => {
      if (!value) return "Нет данных";
      return PERF_MAP[value as string] ? `${value} (${PERF_MAP[value as string]})` : value;
    }
  },
  { 
    field: "assessment360", 
    headerName: "Оценка 360", 
    width: 120,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "era", 
    headerName: "ЭРА", 
    width: 80,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "box", 
    headerName: "BOX", 
    width: 80,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "boxInterpretation", 
    headerName: "Интерпретация BOX", 
    width: 160,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "developmentProgram", 
    headerName: "Программа развития", 
    flex: 1,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "careerStatus", 
    headerName: "Статус карьерного маршрута", 
    width: 160,
    valueGetter: (value) => value || "Нет данных"
  },
];

// Колонки таблицы команды (подчинённые)
export const teamColumns: GridColDef[] = [
  { 
    field: "fullName", 
    headerName: "ФИО", 
    flex: 1, 
    minWidth: 160,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "grade", 
    headerName: "Грейд", 
    width: 80,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "potential", 
    headerName: "Потенциал", 
    width: 140,
    valueGetter: (value) => {
      if (!value) return "Нет данных";
      return POT_MAP[value as string] ? `${value} (${POT_MAP[value as string]})` : value;
    }
  },
  { 
    field: "performance", 
    headerName: "Результативность", 
    width: 160,
    valueGetter: (value) => {
      if (!value) return "Нет данных";
      return PERF_MAP[value as string] ? `${value} (${PERF_MAP[value as string]})` : value;
    }
  },
  { 
    field: "assessment360", 
    headerName: "Оценка 360", 
    width: 120,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "era", 
    headerName: "ЭРА", 
    width: 80,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "box", 
    headerName: "BOX", 
    width: 80,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "boxInterpretation", 
    headerName: "Интерпретация BOX", 
    width: 160,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "developmentProgram", 
    headerName: "Программа развития", 
    flex: 1,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "careerStatus", 
    headerName: "Статус карьерного маршрута", 
    width: 160,
    valueGetter: (value) => value || "Нет данных"
  },
];

// Колонки таблицы преемников
export const successorColumns: GridColDef<Successor>[] = [
  { 
    field: "fullName", 
    headerName: "ФИО", 
    flex: 1, 
    minWidth: 160,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "grade", 
    headerName: "Грейд", 
    width: 80,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "potential", 
    headerName: "Потенциал", 
    width: 140,
    valueGetter: (value) => {
      if (!value) return "Нет данных";
      return POT_MAP[value as string] ? `${value} (${POT_MAP[value as string]})` : value;
    }
  },
  { 
    field: "performance", 
    headerName: "Результативность", 
    width: 160,
    valueGetter: (value) => {
      if (!value) return "Нет данных";
      return PERF_MAP[value as string] ? `${value} (${PERF_MAP[value as string]})` : value;
    }
  },
  { 
    field: "assessment360", 
    headerName: "Оценка 360", 
    width: 120,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "era", 
    headerName: "ЭРА", 
    width: 80,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "box", 
    headerName: "BOX", 
    width: 80,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "boxInterpretation", 
    headerName: "Интерпретация BOX", 
    width: 160,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "developmentProgram", 
    headerName: "Программа развития", 
    flex: 1,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "careerStatus", 
    headerName: "Статус карьерного маршрута", 
    width: 160,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "approvedBy", 
    headerName: "Кто заявил", 
    width: 160,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "approvalDate", 
    headerName: "Дата назначения", 
    width: 130,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "successorStatus", 
    headerName: "Статус преемника", 
    width: 140,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "readiness", 
    headerName: "Готовность", 
    width: 120,
    valueGetter: (value) => value || "Нет данных"
  },
];