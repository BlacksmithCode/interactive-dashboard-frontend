import type { GridColDef } from "@mui/x-data-grid";
import type { ManagerListItem, Successor } from "../../../../types/dashboard";
import { capitalizeFirstLetter } from "./utils";

// Колонки таблицы руководителей
export const leaderColumns: GridColDef<ManagerListItem>[] = [
  { 
    field: "fullName", 
    headerName: "ФИО", 
    flex: 1, 
    minWidth: 180, 
    filterable: false,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "position", 
    headerName: "Должность", 
    flex: 1, 
    minWidth: 200, 
    filterable: false,
    valueGetter: (value) => capitalizeFirstLetter(value) || "Нет данных"
  },
  { 
    field: "domain", 
    headerName: "Домен", 
    width: 160, 
    filterable: false,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "grade", 
    headerName: "Грейд", 
    width: 80, 
    align: "center", 
    headerAlign: "center", 
    filterable: false,
    valueGetter: (value) => (value !== undefined && value !== null) ? value : "Нет данных"
  },
  {
    field: "hasSuccessor",
    headerName: "Преемник",
    width: 120,
    align: "center",
    headerAlign: "center",
    valueGetter: (value) => value === true ? "Да" : value === false ? "Нет" : "Нет данных",
    filterable: false
  },
  {
    field: "critical",
    headerName: "Критичность",
    width: 120,
    align: "center",
    headerAlign: "center",
    valueGetter: (value) => value === true ? "Да" : value === false ? "Нет" : "Нет данных",
    filterable: false
  },
];

// Колонки таблицы команды
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
    field: "assessment360", 
    headerName: "Оценка 360", 
    width: 120,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "performance", 
    headerName: "Результат-ть", 
    width: 130,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "potential", 
    headerName: "Потенциал", 
    width: 100,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "era", 
    headerName: "ЭРА", 
    width: 80,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "developmentProgram", 
    headerName: "Программа развития", 
    flex: 1,
    valueGetter: (value) => value || "Нет данных"
  },
];

// Колонки таблицы преемников
export const successorColumns: GridColDef<Successor>[] = [
  { 
    field: "fullName", 
    headerName: "ФИО преемника", 
    flex: 1, 
    minWidth: 180,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "grade", 
    headerName: "Грейд", 
    width: 80,
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
  { 
    field: "assessment360", 
    headerName: "Оценка 360", 
    width: 120,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "performance", 
    headerName: "Результат-ть", 
    width: 140,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "potential", 
    headerName: "Потенциал", 
    width: 100,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "era", 
    headerName: "ЭРА", 
    width: 100,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "developmentProgram", 
    headerName: "Программа развития", 
    width: 180,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "isApproved", 
    headerName: "Согласован", 
    width: 110,
    valueGetter: (value) => value === true ? "Да" : value === false ? "Нет" : "Нет данных"
  },
  { 
    field: "approvedBy", 
    headerName: "Кем согласован", 
    width: 150,
    valueGetter: (value) => value || "Нет данных"
  },
  { 
    field: "approvalDate", 
    headerName: "Дата согласования", 
    width: 130,
    valueGetter: (value) => value || "Нет данных"
  },
];