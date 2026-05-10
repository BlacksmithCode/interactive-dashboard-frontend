import { useState } from "react";
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Grid,
  Alert,
  Button,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useLeadersQuery } from "../../features/dashboard/hooks/useLeadersQuery";
import { useTeamQuery } from "../../features/dashboard/hooks/useTeamQuery";
import { useSuccessorsQuery } from "../../features/dashboard/hooks/useSuccessorsQuery";
import type { LeaderSummary, TeamMember, Successor } from "../../types/dashboard";

// Колонки для таблицы команды
const teamColumns: GridColDef<TeamMember>[] = [
  { field: "fullName", headerName: "ФИО / Команда", width: 200 },
  { field: "potential", headerName: "Потенциал", width: 100 },
  { field: "potentialValue", headerName: "Знач. пот.", width: 100 },
  { field: "performance", headerName: "Результативность", width: 150 },
  { field: "performanceValue", headerName: "Знач. рез.", width: 100 },
  { field: "box", headerName: "BOX", width: 80 },
  { field: "boxInterpretation", headerName: "Интерпретация BOX", width: 200 },
  { field: "evaluationYear", headerName: "Год оценки", width: 100 },
];

// Колонки для таблицы преемников (добавляем колонку "Кто заявил").
// Тип колонок объявлен как объединение TeamMember и Successor, поскольку
// мы переиспользуем базовые колонки из `teamColumns`, которые описаны
// для `TeamMember`. `Successor` расширяет `TeamMember`, поэтому такой
// объединённый тип безопасен и устраняет ошибку несовместимости
// `GridColDef<TeamMember>` → `GridColDef<Successor>`.
const successorColumns: GridColDef<TeamMember | Successor>[] = [
  ...teamColumns,
  { field: "declaredBy", headerName: "Кто заявил", width: 200 },
  { field: "declarationDate", headerName: "Дата назначения", width: 150 },
];

export default function LeadersSuccessors() {
  const [search, setSearch] = useState("");
  const [selectedLeader, setSelectedLeader] = useState<LeaderSummary | null>(null);

  const { data: leaders, isLoading: leadersLoading, isError: leadersError, refetch: refetchLeaders } = useLeadersQuery(search);
  const { data: team, isLoading: teamLoading, isError: teamError, refetch: refetchTeam } = useTeamQuery(selectedLeader?.id);
  const { data: successors, isLoading: succLoading, isError: succError, refetch: refetchSucc } = useSuccessorsQuery(selectedLeader?.id);

  return (
    <Box>
      {/* Фильтр: выбор руководителя */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Autocomplete
            options={leaders ?? []}
            loading={leadersLoading}
            getOptionLabel={(option) => `${option.fullName} (${option.position})`}
            onInputChange={(_, value) => setSearch(value)}
            onChange={(_, value) => setSelectedLeader(value)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField {...params} label="Поиск руководителя" variant="outlined" />
            )}
            noOptionsText="Ничего не найдено"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          {leadersError && (
            <Alert severity="error" action={<Button size="small" onClick={() => refetchLeaders()}>Повторить</Button>}>
              Ошибка загрузки списка руководителей
            </Alert>
          )}
        </Grid>
      </Grid>

      {/* Таблицы */}
      {selectedLeader && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {selectedLeader.fullName} — {selectedLeader.position}
          </Typography>

          {/* Команда */}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Команда</Typography>
          {teamLoading && <Typography>Загрузка...</Typography>}
          {teamError && (
            <Alert severity="error" action={<Button size="small" onClick={() => refetchTeam()}>Повторить</Button>}>
              Ошибка загрузки команды
            </Alert>
          )}
          {team && (
            <DataGrid
              rows={team}
              columns={teamColumns}
              getRowId={(row) => row.fullName}
              autoHeight
              sx={{ mb: 3 }}
            />
          )}

          {/* Преемники */}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Преемники</Typography>
          {succLoading && <Typography>Загрузка...</Typography>}
          {succError && (
            <Alert severity="error" action={<Button size="small" onClick={() => refetchSucc()}>Повторить</Button>}>
              Ошибка загрузки преемников
            </Alert>
          )}
          {successors && (
            <DataGrid
              rows={successors}
              columns={successorColumns}
              getRowId={(row) => row.fullName}
              autoHeight
            />
          )}
        </Box>
      )}
    </Box>
  );
}
