import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Alert,
  Button,
  Chip,
} from "@mui/material";
import { DataGrid, type GridRowParams, type GridColDef } from "@mui/x-data-grid";
import { useLeadersQuery } from "../../features/dashboard/hooks/useLeadersQuery";
import { useTeamQuery } from "../../features/dashboard/hooks/useTeamQuery";
import { useSuccessorsQuery } from "../../features/dashboard/hooks/useSuccessorsQuery";
import { useDashboardFilters } from "../../features/dashboard/hooks/useDashboardFilters";
import type { ManagerListItem, Successor } from "../../types/dashboard";

// ── Колонки таблицы руководителей ──────────────────────────────
const leaderColumns: GridColDef<ManagerListItem>[] = [
  { field: "fullName", headerName: "ФИО", flex: 1, minWidth: 180 },
  { field: "position", headerName: "Должность", flex: 1, minWidth: 200 },
  { field: "domain", headerName: "Домен", width: 160 },
  { field: "grade", headerName: "Грейд", width: 80, align: "center", headerAlign: "center" },
  {
    field: "hasSuccessor",
    headerName: "Преемник",
    width: 120,
    align: "center",
    headerAlign: "center",
    valueFormatter: (params) => (params ? "Да" : "Нет"),
  },
  {
    field: "critical",
    headerName: "Критичность",
    width: 120,
    align: "center",
    headerAlign: "center",
    valueFormatter: (params) => (params ? "Да" : "Нет"),
  },
];

// ── Колонки таблицы команды ────────────────────────────────────
const teamColumns: GridColDef[] = [
  { field: "fullName", headerName: "ФИО", flex: 1, minWidth: 160 },
  { field: "grade", headerName: "Грейд", width: 80 },
  { field: "assessment360", headerName: "Оценка 360", width: 120 },
  { field: "performance", headerName: "Результат-ть", width: 130 },
  { field: "potential", headerName: "Потенциал", width: 100 },
  { field: "era", headerName: "Эра", width: 80 },
  { field: "developmentProgram", headerName: "Программа развития", flex: 1 },
];

// ── Колонки таблицы преемников ─────────────────────────────────
const successorColumns: GridColDef<Successor>[] = [
  { field: "fullName", headerName: "ФИО преемника", flex: 1, minWidth: 180 },
  { field: "queue", headerName: "Очередь", width: 80 },
  { field: "readiness", headerName: "Готовность", width: 120 },
  { field: "successorStatus", headerName: "Статус", width: 130 },
  { field: "declarant", headerName: "Заявитель", width: 180 },
  { field: "assessment360", headerName: "Оценка 360", width: 120 },
  { field: "performance", headerName: "Результат-ть", width: 140 },
  { field: "potential", headerName: "Потенциал", width: 100 },
  { field: "era", headerName: "Эра", width: 100 },
  { field: "developmentProgram", headerName: "Программа развития", width: 180 },
  { field: "comments", headerName: "Комментарии", width: 200 },
  { field: "careerStage", headerName: "Карьерный этап", width: 140 },
  { field: "isApproved", headerName: "Согласован", width: 110 },
  { field: "approvedBy", headerName: "Кем согласован", width: 150 },
  { field: "approvalDate", headerName: "Дата согласования", width: 130 },
];

// ── Подсветка строк без преемника ──────────────────────────────
const getRowClassName = (params: GridRowParams<ManagerListItem>) =>
  params.row.hasSuccessor ? "" : "row-without-successor";

export default function LeadersSuccessors() {
  const { filters } = useDashboardFilters();

  const [selectedLeader, setSelectedLeader] = useState<ManagerListItem | null>(null);

  // загрузка списка руководителей
  const {
    data: leaders = [],
    isLoading: leadersLoading,
    isError: leadersError,
    refetch: refetchLeaders,
  } = useLeadersQuery({ gradeMin: filters.gradeMin, domain: filters.domain });

  // команда и преемники выбранного руководителя
  const {
    data: team = [],
    isLoading: teamLoading,
    isError: teamError,
    refetch: refetchTeam,
  } = useTeamQuery(selectedLeader?.fullName);

  const {
    data: successors = [],
    isLoading: succLoading,
    isError: succError,
    refetch: refetchSucc,
  } = useSuccessorsQuery(selectedLeader?.fullName);

  const handleRowClick = useCallback(
    (params: GridRowParams<ManagerListItem>) => setSelectedLeader(params.row),
    []
  );

  const handleResetSelection = () => setSelectedLeader(null);

  return (
    <Box>
      {/* Ошибка загрузки руководителей */}
      {leadersError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button size="small" onClick={() => refetchLeaders()}>
              Повторить
            </Button>
          }
        >
          Ошибка загрузки списка руководителей
        </Alert>
      )}

      {/* Таблица руководителей */}
      <Box sx={{ width: "100%", height: 400, mb: 4 }}>
        <DataGrid
          rows={leaders}
          columns={leaderColumns}
          loading={leadersLoading}
          getRowId={(row) => row.fullName}
          getRowClassName={getRowClassName}
          onRowClick={handleRowClick}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          sx={{
            "& .row-without-successor": {
              backgroundColor: (theme) =>
                theme.palette.mode === "light"
                  ? "rgba(255,0,0,0.05)"
                  : "rgba(255,0,0,0.15)",
              "&:hover": {
                backgroundColor: (theme) =>
                  theme.palette.mode === "light"
                    ? "rgba(255,0,0,0.1)"
                    : "rgba(255,0,0,0.25)",
              },
            },
          }}
        />
      </Box>

      {/* Детали выбранного руководителя */}
      {selectedLeader && (
        <Box sx={{ mt: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h6">
              {selectedLeader.fullName} – {selectedLeader.position}
            </Typography>
            <Button variant="outlined" size="small" onClick={handleResetSelection}>
              Сбросить выбор
            </Button>
          </Box>

          {/* Статусные чипы */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Chip label={`Домен: ${selectedLeader.domain}`} size="small" variant="outlined" />
            <Chip label={`Грейд: ${selectedLeader.grade}`} size="small" variant="outlined" />
            <Chip
              label={selectedLeader.hasSuccessor ? "Есть преемник" : "Нет преемника"}
              size="small"
              color={selectedLeader.hasSuccessor ? "success" : "error"}
            />
            {selectedLeader.critical && (
              <Chip label="Критичная роль" size="small" color="warning" />
            )}
          </Box>

          {/* Команда */}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Команда
          </Typography>
          {teamLoading && <Typography>Загрузка команды...</Typography>}
          {teamError && (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={() => refetchTeam()}>
                  Повторить
                </Button>
              }
            >
              Ошибка загрузки команды
            </Alert>
          )}
          {!teamLoading && !teamError && (
            <Box sx={{ height: 300, mb: 3 }}>
              <DataGrid
                rows={team}
                columns={teamColumns}
                getRowId={(row) => row.fullName}
                pageSizeOptions={[5, 10]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 5 } },
                }}
              />
            </Box>
          )}

          {/* Преемники */}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Преемники
          </Typography>
          {succLoading && <Typography>Загрузка преемников...</Typography>}
          {succError && (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={() => refetchSucc()}>
                  Повторить
                </Button>
              }
            >
              Ошибка загрузки преемников
            </Alert>
          )}
          {!succLoading && !succError && (
            <Box sx={{ height: 400 }}>
              <DataGrid
                rows={successors}
                columns={successorColumns}
                getRowId={(row) => `${row.fullName}_${row.queue}`}
                pageSizeOptions={[5, 10]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 5 } },
                }}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}