// src/pages/panels/LeadersSuccessors.tsx

import { useState, useCallback, useMemo, useRef } from "react";
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
import { useManagerDetailQuery } from "../../features/dashboard/hooks/useManagerDetailQuery"; // новый хук
import { GradeFilterInput } from "../../features/dashboard/components/GradeFilterInput";
import { useDomainGistQuery } from "../../features/dashboard/hooks/useDomainGistQuery";
import type { ManagerListItem, Successor } from "../../types/dashboard";

const capitalizeFirstLetter = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// ─── Колонки таблицы руководителей (без изменений) ─────────────────
const leaderColumns: GridColDef<ManagerListItem>[] = [
  { field: "fullName", headerName: "ФИО", flex: 1, minWidth: 180, filterable: false },
  { field: "position", headerName: "Должность", flex: 1, minWidth: 200, filterable: false, valueFormatter: (params) => capitalizeFirstLetter(params),},
  { field: "domain", headerName: "Домен", width: 160, filterable: false },
  { field: "grade", headerName: "Грейд", width: 80, align: "center", headerAlign: "center", filterable: false },
  {
    field: "hasSuccessor",
    headerName: "Преемник",
    width: 120,
    align: "center",
    headerAlign: "center",
    valueFormatter: (params) => (params ? "Да" : "Нет"),
    filterable: false
  },
  {
    field: "critical",
    headerName: "Критичность",
    width: 120,
    align: "center",
    headerAlign: "center",
    valueFormatter: (params) => (params ? "Да" : "Нет"),
    filterable: false
  },
];

// ─── Колонки таблицы команды (без изменений) ─────────────────────
const teamColumns: GridColDef[] = [
  { field: "fullName", headerName: "ФИО", flex: 1, minWidth: 160 },
  { field: "grade", headerName: "Грейд", width: 80 },
  { field: "assessment360", headerName: "Оценка 360", width: 120 },
  { field: "performance", headerName: "Результат-ть", width: 130 },
  { field: "potential", headerName: "Потенциал", width: 100 },
  { field: "era", headerName: "ЭРА", width: 80 },
  { field: "developmentProgram", headerName: "Программа развития", flex: 1 },
];

// ─── Колонки таблицы преемников (обновлены) ──────────────────────
const successorColumns: GridColDef<Successor>[] = [
  { field: "fullName", headerName: "ФИО преемника", flex: 1, minWidth: 180 },
  { field: "queue", headerName: "Очередь", width: 80 },
  { field: "assessment360", headerName: "Оценка 360", width: 120 },
  { field: "performance", headerName: "Результат-ть", width: 140 },
  { field: "potential", headerName: "Потенциал", width: 100 },
  { field: "era", headerName: "ЭРА", width: 100 },
  { field: "developmentProgram", headerName: "Программа развития", width: 180 },
  { field: "declarantFullName", headerName: "Заявитель", width: 180 },
  { field: "isApproved", headerName: "Согласован", width: 110 },
  { field: "approvedBy", headerName: "Кем согласован", width: 150 },
  { field: "approvalDate", headerName: "Дата согласования", width: 130 },
];

// ─── Подсветка строк без преемника ──────────────────────────────
const getRowClassName = (params: GridRowParams<ManagerListItem>) =>
  params.row.hasSuccessor ? "" : "row-without-successor";

export default function LeadersSuccessors() {
  const [searchParams] = useSearchParams();

  // Инициализация фильтров из URL
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

  // Refs для Enter на автокомплитах
  const searchInputRef = useRef<HTMLInputElement>(null);
  const positionInputRef = useRef<HTMLInputElement>(null);

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

  const uniquePositions = useMemo(() => {
    if (!allManagers) return [];
    return [...new Set(allManagers.map((m) => capitalizeFirstLetter(m.position)))].sort();
  }, [allManagers]);

  // Запрос списка руководителей с фильтрами, поддерживаемыми API
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

  // Автодополнение ФИО
  const filteredNameOptions = useMemo(() => {
    const names = allManagers?.map((m) => m.fullName) ?? [];
    if (!searchName.trim()) return names;
    const lower = searchName.trim().toLowerCase();
    return names.filter((name) => name.toLowerCase().includes(lower));
  }, [allManagers, searchName]);

  // Автодополнение должности
  const filteredPositionOptions = useMemo(() => {
    if (!positionFilter.trim()) return uniquePositions;
    const lower = positionFilter.trim().toLowerCase();
    return uniquePositions.filter((pos) => pos.toLowerCase().includes(lower));
  }, [uniquePositions, positionFilter]);

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

  // Детальная информация о руководителе (новый хук)
  const {
    data: managerDetail,
    isLoading: detailLoading,
    isError: detailError,
  } = useManagerDetailQuery(selectedLeader?.fullName);

  const handleRowClick = useCallback(
    (params: GridRowParams<ManagerListItem>) => setSelectedLeader(params.row),
    []
  );

  const handleResetSelection = () => setSelectedLeader(null);

  const resetAllFilters = useCallback(() => {
    setGradeMin(initialGradeMin ? parseInt(initialGradeMin) : undefined);
    setDomain(initialDomain || undefined);
    setSearchName("");
    setPositionFilter("");
    setCriticalFilter(undefined);
    setSuccessorFilter(undefined);
  }, [initialGradeMin, initialDomain]);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3, flexWrap: "wrap", alignItems: "center" }}
        useFlexGap
      >
        {/* Поле поиска по ФИО */}
        <Autocomplete
          freeSolo
          disableClearable={false}
          clearOnBlur={false}
          selectOnFocus={true}
          openOnFocus={true}
          options={filteredNameOptions}
          value={searchName}
          inputValue={searchName}
          onInputChange={(_, newValue) => {
            const cleaned = newValue.replace(/[^а-яА-ЯёЁa-zA-Z \-.]/g, "");
            setSearchName(cleaned);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const input = (e.target as HTMLElement)
                .closest('.MuiAutocomplete-root')
                ?.querySelector('input');
              if (input) input.blur();
              return;
            }
            const allowed = [
              "Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
              "Tab", "Home", "End", "Escape",
            ];
            if (allowed.includes(e.key)) return;
            if (/^[a-zA-Zа-яА-ЯёЁ \-.]$/.test(e.key)) return;
            e.preventDefault();
          }}
          size="small"
          sx={{ minWidth: 200 }}
          clearIcon={searchName ? undefined : null}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Поиск по ФИО"
              inputRef={searchInputRef}
              onPaste={(e) => {
                e.preventDefault();
                const pasted = e.clipboardData.getData("text");
                const cleaned = pasted.replace(/[^а-яА-ЯёЁa-zA-Z \-.]/g, "");
                setSearchName((prev) => prev + cleaned);
              }}
            />
          )}
        />

        {/* Поле должности */}
        <Autocomplete
          freeSolo
          disableClearable={false}
          clearOnBlur={false}
          selectOnFocus={true}
          openOnFocus={true}
          options={filteredPositionOptions}
          value={positionFilter}
          inputValue={positionFilter}
          onInputChange={(_, newValue) => setPositionFilter(newValue)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const input = (e.target as HTMLElement)
                .closest('.MuiAutocomplete-root')
                ?.querySelector('input');
              if (input) input.blur();
              return;
            }
          }}
          size="small"
          sx={{ minWidth: 200 }}
          clearIcon={positionFilter ? undefined : null}
          renderInput={(params) => (
            <TextField {...params} label="Должность" inputRef={positionInputRef} />
          )}
        />

        <GradeFilterInput
          label="Грейд"
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
            <MenuItem value="true">Критичные</MenuItem>
            <MenuItem value="false">Некритичные</MenuItem>
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
  
        <Button
          variant="outlined"
          size="small"
          onClick={resetAllFilters}
          sx={{ minWidth: 140 }}
        >
          Сбросить фильтры
        </Button>
      </Stack>

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
              {selectedLeader.fullName} – {capitalizeFirstLetter(selectedLeader.position)}
            </Typography>
            <Button variant="outlined" size="small" onClick={handleResetSelection}>
              Сбросить выбор
            </Button>
          </Box>

          {/* Статусные чипсы */}
          <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
            <Chip label={`Домен: ${selectedLeader.domain}`} size="small" variant="outlined" />
            <Chip label={`Грейд: ${selectedLeader.grade}`} size="small" variant="outlined" />
            {detailLoading ? (
              <Chip label="Загрузка..." size="small" color="default" />
            ) : detailError ? (
              <Chip label="Ошибка загрузки деталей" size="small" color="error" />
            ) : managerDetail ? (
              <>
                <Chip
                  label={`Преемников: ${managerDetail.successorsCount}`}
                  size="small"
                  color={managerDetail.successorsCount > 0 ? "success" : "error"}
                />
                {managerDetail.readiness && (
                  <Chip
                    label={`Готовность: ${managerDetail.readiness}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </>
            ) : null}
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