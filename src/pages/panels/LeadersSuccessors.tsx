import { useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Alert,
  Button,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Autocomplete,
} from "@mui/material";
import { DataGrid, type GridRowParams, type GridColDef } from "@mui/x-data-grid";
import { useSearchParams } from "react-router-dom";
import { useLeadersQuery } from "../../features/dashboard/hooks/useLeadersQuery";
import { useTeamQuery } from "../../features/dashboard/hooks/useTeamQuery";
import { useSuccessorsQuery } from "../../features/dashboard/hooks/useSuccessorsQuery";
import { GradeFilterInput } from "../../features/dashboard/components/GradeFilterInput";
import { useDomainGistQuery } from "../../features/dashboard/hooks/useDomainGistQuery";
import type { ManagerListItem, Successor } from "../../types/dashboard";

// ─── Колонки таблицы руководителей ──────────────────────────────
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

// ─── Колонки таблицы команды ─────────────────────────────────────
const teamColumns: GridColDef[] = [
  { field: "fullName", headerName: "ФИО", flex: 1, minWidth: 160 },
  { field: "grade", headerName: "Грейд", width: 80 },
  { field: "assessment360", headerName: "Оценка 360", width: 120 },
  { field: "performance", headerName: "Результат-ть", width: 130 },
  { field: "potential", headerName: "Потенциал", width: 100 },
  { field: "era", headerName: "Эра", width: 80 },
  { field: "developmentProgram", headerName: "Программа развития", flex: 1 },
];

// ─── Колонки таблицы преемников ──────────────────────────────────
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

// ─── Подсветка строк без преемника ───────────────────────────────
const getRowClassName = (params: GridRowParams<ManagerListItem>) =>
  params.row.hasSuccessor ? "" : "row-without-successor";

export default function LeadersSuccessors() {
  const [searchParams] = useSearchParams();
  
  // Инициализация из URL
  const initialGradeMin = searchParams.get("gradeMin");
  const initialDomain = searchParams.get("domain");

  const [gradeMin, setGradeMin] = useState<number | undefined>(
    initialGradeMin ? parseInt(initialGradeMin) : undefined
  );
  const [domain, setDomain] = useState<string | undefined>(
    initialDomain || undefined
  );

  // Локальные фильтры
  const [searchName, setSearchName] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [criticalFilter, setCriticalFilter] = useState<boolean | undefined>(undefined);
  const [successorFilter, setSuccessorFilter] = useState<boolean | undefined>(undefined);

  const [selectedLeader, setSelectedLeader] = useState<ManagerListItem | null>(null);

  // Загрузка всех руководителей для определения границ грейда и списка должностей
  const { data: allManagers } = useLeadersQuery({});

  const minGrade = useMemo(() => {
    if (!allManagers || allManagers.length === 0) return undefined;
    return Math.min(...allManagers.map((m) => m.grade));
  }, [allManagers]);

  const maxGrade = useMemo(() => {
    if (!allManagers || allManagers.length === 0) return undefined;
    return Math.max(...allManagers.map((m) => m.grade));
  }, [allManagers]);

  // Уникальные должности для автодополнения
  const uniquePositions = useMemo(() => {
    if (!allManagers) return [];
    return [...new Set(allManagers.map((m) => m.position))].sort();
  }, [allManagers]);

  // Запрос с передачей фильтров, поддерживаемых API
  // Запрос с передачей всех фильтров
  const {
    data: leaders = [],
    isLoading: leadersLoading,
    isError: leadersError,
    refetch: refetchLeaders,
  } = useLeadersQuery({
    gradeMin,
    domain: domain || undefined,
    critical: criticalFilter,
    hasSuccessor: successorFilter,
  });

  const { data: domainGist = [] } = useDomainGistQuery({});
  const availableDomains = useMemo(
    () => [...new Set(domainGist.map((d) => d.domain))].sort(),
    [domainGist]
  );


  // Локальная фильтрация по ФИО и должности
  const filteredLeaders = useMemo(() => {
    let result = leaders;
    if (searchName.trim()) {
      const lower = searchName.trim().toLowerCase();
      result = result.filter((l) => l.fullName.toLowerCase().includes(lower));
    }
    if (positionFilter.trim()) {
      const lower = positionFilter.trim().toLowerCase();
      result = result.filter((l) => l.position.toLowerCase().includes(lower));
    }
    return result;
  }, [leaders, searchName, positionFilter]);

  // Данные по выбранному руководителю
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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3, flexWrap: "wrap", alignItems: "center" }}
        useFlexGap
      >
        <TextField
          label="Поиск по ФИО"
          size="small"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <Autocomplete
          freeSolo
          openOnFocus={false}
          options={uniquePositions}
          value={positionFilter}
          onInputChange={(_, newValue) => setPositionFilter(newValue)}
          onChange={(_, newValue) => setPositionFilter(newValue ?? "")}
          size="small"
          sx={{ minWidth: 200 }}
          renderInput={(params) => <TextField {...params} label="Должность" />}
        />
        <GradeFilterInput
          value={gradeMin}
          onChange={setGradeMin}
          defaultMinGrade={minGrade}
          minPossibleGrade={minGrade}
          maxPossibleGrade={maxGrade}
        />
        <TextField
          label="Домен"
          select
          size="small"
          value={domain ?? ""}
          onChange={(e) => setDomain(e.target.value || undefined)}
          sx={{ minWidth: 160 }}
        >
      <MenuItem value="">Все домены</MenuItem>
        {availableDomains.map((d) => (
          <MenuItem key={d} value={d}>
            {d}
          </MenuItem>
        ))}
        </TextField>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Критичность</InputLabel>
          <Select
            value={criticalFilter === undefined ? "all" : criticalFilter.toString()}
            label="Критичность"
            onChange={(e) => {
              const val = e.target.value;
              setCriticalFilter(val === "all" ? undefined : val === "true");
            }}
          >
            <MenuItem value="all">Все</MenuItem>
            <MenuItem value="true">Критические</MenuItem>
            <MenuItem value="false">Некритические</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Преемник</InputLabel>
          <Select
            value={successorFilter === undefined ? "all" : successorFilter.toString()}
            label="Преемник"
            onChange={(e) => {
              const val = e.target.value;
              setSuccessorFilter(val === "all" ? undefined : val === "true");
            }}
          >
            <MenuItem value="all">Все</MenuItem>
            <MenuItem value="true">Есть преемник</MenuItem>
            <MenuItem value="false">Нет преемника</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Ошибка загрузки */}
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
          rows={filteredLeaders}
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

          {/* Статусные чипсы */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Chip label={`Домен: ${selectedLeader.domain}`} size="small" variant="outlined" />
            <Chip label={`Грейд: ${selectedLeader.grade}`} size="small" variant="outlined" />
            <Chip
              label={selectedLeader.hasSuccessor ? "Есть преемник" : "Нет преемника"}
              size="small"
              color={selectedLeader.hasSuccessor ? "success" : "error"}
            />
            {selectedLeader.critical && (
              <Chip label="Критическая роль" size="small" color="warning" />
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