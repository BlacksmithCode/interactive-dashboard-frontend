// src/features/dashboard/widgets/LeadersSuccessors.tsx

import { useState, useMemo, useEffect } from "react";
import { Box, Alert, Button, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { Theme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { useSearchParams } from "react-router-dom";
import {
  useDashboardFilters,
  useLeadersQuery,
  useTeamQuery,
  useSuccessorsQuery,
  useManagerDetailQuery,
} from "../features/dashboard/hooks";
import { DashboardFiltersProvider } from "../features/dashboard/context/DashboardFiltersProvider";
import type { ManagerListItem } from "../shared/types/dashboard";
import { gridLocaleRu } from "../locales/gridLocaleRu";
import { useAuth } from "../app/providers/useAuth";
import { ROLES } from "../shared/ui/roles";
import { capitalizeFirstLetter, getRowClassName, leaderColumns, FiltersBar, LeaderDetails } from "./leaders-successors/index";

// --- Константы цветов для шапки таблицы ---
const LEADERS_HEADER_BG = "#ee5d48"; // Красный фон
const HEADER_TEXT_COLOR = "#ffffff"; // Белый текст и иконки

export default function LeadersSuccessors() {
  const [searchParams] = useSearchParams();
  const initialGradeMin = searchParams.get("gradeMin");
  const initialDomain = searchParams.get("domain");

  return (
    <DashboardFiltersProvider
      initialGradeMin={initialGradeMin ? parseInt(initialGradeMin) : undefined}
      initialDomain={initialDomain || undefined}
    >
      <LeadersSuccessorsContent />
    </DashboardFiltersProvider>
  );
}

function LeadersSuccessorsContent() {
  const { role } = useAuth();
  const { filters, setGradeMin, setDomain, minGrade, maxGrade, availableDomains } = useDashboardFilters();

  // Локальные UI-фильтры (поиск по ФИО/должности, критичность, преемник)
  const [searchName, setSearchName] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [criticalFilter, setCriticalFilter] = useState<boolean | undefined>(undefined);
  const [successorFilter, setSuccessorFilter] = useState<boolean | undefined>(undefined);

  const [selectedLeader, setSelectedLeader] = useState<ManagerListItem | null>(null);
  const [isListExpanded, setIsListExpanded] = useState(true);

  // Запрос списка руководителей с фильтрами
  const {
    data: leaders = [],
    isLoading: leadersLoading,
    isError: leadersError,
    refetch: refetchLeaders,
  } = useLeadersQuery({
    gradeMin: filters.gradeMin,
    domains: filters.domain ? [filters.domain] : undefined,
    critical: criticalFilter,
    hasSuccessor: successorFilter,
  });

  // Метаданные для автокомплита
  const { data: allManagers = [] } = useLeadersQuery({});

  const uniquePositions = useMemo(() => {
    if (!allManagers) return [];
    return [...new Set(allManagers.map((m) => capitalizeFirstLetter(m.position)))].sort();
  }, [allManagers]);

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

  // Локальная фильтрация ТОЛЬКО по ФИО и должности (остальное на бэкенде)
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

  // Автоматически открываем карточку, если зашел MANAGER (у него всегда только 1 запись)
  useEffect(() => {
    if (role === ROLES.MANAGER && filteredLeaders.length > 0 && !selectedLeader) {
      const timer = setTimeout(() => {
        setSelectedLeader(filteredLeaders[0]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [role, filteredLeaders, selectedLeader]);


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

  const {
    data: managerDetail,
    isLoading: detailLoading,
    isError: detailError,
  } = useManagerDetailQuery(selectedLeader?.fullName);

  const handleRowClick = (params: { row: ManagerListItem }) => {
    setSelectedLeader(params.row);
    setIsListExpanded(false); // Сворачиваем таблицу при выборе
  };

  const handleResetSelection = () => {
    if (role !== ROLES.MANAGER) {
      setSelectedLeader(null);
      setIsListExpanded(true); // Разворачиваем таблицу при закрытии карточки
    }
  };

  const resetAllFilters = () => {
    setGradeMin(undefined);
    setDomain(undefined);
    setSearchName("");
    setPositionFilter("");
    setCriticalFilter(undefined);
    setSuccessorFilter(undefined);
  };

  return (
    <Box>
      {/* Таблица руководителей в виде аккордеона (полностью скрыта для менеджера) */}
      {role !== ROLES.MANAGER && (
        <Accordion
          expanded={isListExpanded}
          onChange={(_, expanded) => setIsListExpanded(expanded)}
          sx={{
            mb: 4,
            borderRadius: "12px !important",
            "&:before": { display: "none" },
            boxShadow: 1,
            overflow: "hidden"
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "background.paper" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Список руководителей
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 2, bgcolor: "background.default" }}>
          <FiltersBar
            filters={filters as { gradeMin: number | undefined; domain: string | undefined }}
            setGradeMin={setGradeMin}
            setDomain={setDomain}
            minGrade={minGrade ?? 0}
            maxGrade={maxGrade ?? 0}
            availableDomains={availableDomains}
            searchName={searchName}
            setSearchName={setSearchName}
            positionFilter={positionFilter}
            setPositionFilter={setPositionFilter}
            criticalFilter={criticalFilter}
            setCriticalFilter={setCriticalFilter}
            successorFilter={successorFilter}
            setSuccessorFilter={setSuccessorFilter}
            resetAllFilters={resetAllFilters}
            filteredNameOptions={filteredNameOptions}
            filteredPositionOptions={filteredPositionOptions}
          />

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
              localeText={gridLocaleRu}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              sx={{
                "& .MuiDataGrid-columnHeaders, & .MuiDataGrid-container--top": {
                  backgroundColor: LEADERS_HEADER_BG,
                  color: HEADER_TEXT_COLOR,
                },
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: LEADERS_HEADER_BG,
                  color: HEADER_TEXT_COLOR,
                },
                "& .MuiDataGrid-columnHeaders .MuiDataGrid-filler, & .MuiDataGrid-container--top .MuiDataGrid-filler": {
                  backgroundColor: LEADERS_HEADER_BG,
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-columnHeaders .MuiIconButton-root, & .MuiDataGrid-columnHeaders .MuiSvgIcon-root": {
                  color: HEADER_TEXT_COLOR,
                  backgroundColor: "transparent !important",
                },
                "& .MuiDataGrid-columnHeaders .MuiSvgIcon-root path": {
                  fill: HEADER_TEXT_COLOR,
                },
                "& .MuiDataGrid-columnSeparator": {
                  color: "rgba(255, 255, 255, 0.5)",
                },
                "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                  outline: "none",
                },
                "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
                  outline: "none",
                },
                "& .MuiDataGrid-row:hover": {
                  cursor: "pointer",
                },
                "& .row-without-successor": {
                  backgroundColor: (theme: Theme) =>
                    theme.palette.mode === "light"
                      ? "rgba(255,0,0,0.05)"
                      : "rgba(255,0,0,0.15)",
                  "&:hover": {
                    backgroundColor: (theme: Theme) =>
                      theme.palette.mode === "light"
                        ? "rgba(255,0,0,0.1)"
                        : "rgba(255,0,0,0.25)",
                  },
                },
              }}
            />
          </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Сообщение для менеджера, если его нет в БД сотрудников */}
      {role === ROLES.MANAGER && filteredLeaders.length === 0 && !leadersLoading && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          Ваши данные не найдены в базе сотрудников. Обратитесь к администратору.
        </Alert>
      )}

      {/* Детали выбранного руководителя */}
      <LeaderDetails
        selectedLeader={selectedLeader}
        handleResetSelection={handleResetSelection}
        managerDetail={managerDetail}
        detailLoading={detailLoading}
        detailError={detailError}
        team={team}
        teamLoading={teamLoading}
        teamError={teamError}
        refetchTeam={refetchTeam}
        successors={successors}
        succLoading={succLoading}
        succError={succError}
        refetchSucc={refetchSucc}
      />
    </Box>
  );
}