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
  const {
    filters,
    availableDomains,
    searchName,
    debouncedSearchName,
    positionFilter,
    debouncedPositionFilter,
    criticalFilter,
    successorFilter,
  } = useDashboardFilters();

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

  // Оставляем только руководителей с точным совпадением грейда для этой страницы
  const exactGradeLeaders = useMemo(() => {
    if (filters.gradeMin === undefined) return leaders;
    return leaders.filter((l) => l.grade === filters.gradeMin);
  }, [leaders, filters.gradeMin]);

  // Автодополнение ФИО (с учетом фильтра по должности)
  const filteredNameOptions = useMemo(() => {
    let relevantLeaders = exactGradeLeaders;
    if (positionFilter.trim()) {
      const lowerPos = positionFilter.trim().toLowerCase();
      relevantLeaders = relevantLeaders.filter((l) => l.position.toLowerCase().includes(lowerPos));
    }
    const names = relevantLeaders.map((m) => m.fullName);
    
    if (!searchName.trim()) return names;
    const lowerName = searchName.trim().toLowerCase();
    return names.filter((name) => name.toLowerCase().includes(lowerName));
  }, [exactGradeLeaders, searchName, positionFilter]);

  // Автодополнение должности (с учетом фильтра по ФИО)
  const filteredPositionOptions = useMemo(() => {
    let relevantLeaders = exactGradeLeaders;
    if (searchName.trim()) {
      const lowerName = searchName.trim().toLowerCase();
      relevantLeaders = relevantLeaders.filter((l) => l.fullName.toLowerCase().includes(lowerName));
    }
    const positions = [...new Set(relevantLeaders.map((m) => capitalizeFirstLetter(m.position)))].sort();
    
    if (!positionFilter.trim()) return positions;
    const lowerPos = positionFilter.trim().toLowerCase();
    return positions.filter((pos) => pos.toLowerCase().includes(lowerPos));
  }, [exactGradeLeaders, searchName, positionFilter]);

  // Автодополнение домена (с учетом фильтров по ФИО и должности)
  const filteredDomainOptions = useMemo(() => {
    let relevantLeaders = exactGradeLeaders;
    if (searchName.trim()) {
      const lowerName = searchName.trim().toLowerCase();
      relevantLeaders = relevantLeaders.filter((l) => l.fullName.toLowerCase().includes(lowerName));
    }
    if (positionFilter.trim()) {
      const lowerPos = positionFilter.trim().toLowerCase();
      relevantLeaders = relevantLeaders.filter((l) => l.position.toLowerCase().includes(lowerPos));
    }
    const activeDomains = new Set(relevantLeaders.map((m) => m.domain));
    
    // Обязательно сохраняем уже выбранный домен, чтобы Autocomplete не сбоил и позволял переключаться
    if (filters.domain) activeDomains.add(filters.domain);
    
    return availableDomains.filter((d) => activeDomains.has(d));
  }, [exactGradeLeaders, searchName, positionFilter, availableDomains, filters.domain]);

  // Локальная фильтрация с использованием debounced значений
  const filteredLeaders = useMemo(() => {
    let result = exactGradeLeaders;
    if (debouncedSearchName.trim()) {
      const lower = debouncedSearchName.trim().toLowerCase();
      result = result.filter((l) => l.fullName.toLowerCase().includes(lower));
    }
    if (debouncedPositionFilter.trim()) {
      const lower = debouncedPositionFilter.trim().toLowerCase();
      result = result.filter((l) => l.position.toLowerCase().includes(lower));
    }
    return result;
  }, [exactGradeLeaders, debouncedSearchName, debouncedPositionFilter]);

  // Динамические опции для Критичности (только то, что есть в отфильтрованной таблице)
  const availableCriticalOptions = useMemo(() => {
    const options = new Set<string>();
    filteredLeaders.forEach((l) => {
      if (l.critical !== undefined) options.add(l.critical.toString());
    });
    return Array.from(options);
  }, [filteredLeaders]);

  // Динамические опции для Преемника (безопасно для TypeScript, без any)
  const availableSuccessorOptions = useMemo(() => {
    const options = new Set<string>();
    filteredLeaders.forEach((l) => {
      // Приводим к безопасному типу Record, чтобы избежать ошибки eslint: no-explicit-any
      const leaderData = l as unknown as Record<string, unknown>;
      if (typeof leaderData.hasSuccessor === 'boolean') {
        options.add(String(leaderData.hasSuccessor));
      } else if (typeof leaderData.successorsCount === 'number') {
        options.add(String(leaderData.successorsCount > 0));
      }
    });
    return Array.from(options);
  }, [filteredLeaders]);

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
            filteredNameOptions={filteredNameOptions}
            filteredPositionOptions={filteredPositionOptions}
            filteredDomainOptions={filteredDomainOptions}
            availableCriticalOptions={availableCriticalOptions}
            availableSuccessorOptions={availableSuccessorOptions}
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
              localeText={{ ...gridLocaleRu, noRowsLabel: "Ничего не найдено" }}
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