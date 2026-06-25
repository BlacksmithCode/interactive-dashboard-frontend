// src/features/dashboard/widgets/LeadersSuccessors.tsx

import { Box, Alert, Button, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DataGrid, type GridSortModel, type GridPaginationModel } from "@mui/x-data-grid";
import { useSearchParams } from "react-router-dom";
import { DashboardFiltersProvider, useLeadersSuccessors, useDashboardFilters, FIELD_MAP } from "@/features/dashboard";
import { downloadExcelExport } from "@/features/dashboard/api/export";
import { downloadFile } from "@/shared/lib/download";
import { gridLocaleRu } from "@/shared/config/locales/gridLocaleRu";
import { leaderColumns } from "../config/columns";
import { FiltersBar } from "./FiltersBar";
import { LeaderDetails } from "./LeaderDetails";
import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import type { DashboardFilters } from "@/entities/dashboard";
import DownloadIcon from '@mui/icons-material/Download';

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
  const [exportLoading, setExportLoading] = useState(false);
  const {
    // Список
    leaders,
    totalCount,
    leadersLoading,
    leadersFetching,
    leadersError,
    refetchLeaders,

    // Пагинация
    page,
    setPage,
    pageSize,
    setPageSize,

    // Сортировка
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,

    // Выбор
    selectedLeader,
    handleSelectLeader,
    handleResetSelection,
    isListExpanded,
    setIsListExpanded,

    // Фильтры (для передачи в FiltersBar)
    filteredNameOptions,
    filteredPositionOptions,
    filteredDomainOptions,

    // Детали
    managerDetail,
    detailLoading,
    detailError,
    team,
    teamLoading,
    teamError,
    refetchTeam,
    successors,
    successorsLoading,
    succError,
    refetchSucc,
  } = useLeadersSuccessors();

  const { filters } = useDashboardFilters();

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const blob = await downloadExcelExport({
        gradeMin: filters.gradeMin,
        domain: filters.domain,
        critical: filters.critical,
        hasSuccessor: filters.hasSuccessor,
        searchName: filters.searchName,
        positionFilter: filters.positionFilter,
      });
      downloadFile(blob, "export.xlsx");
    } catch (err) {
      console.error("Ошибка при экспорте Excel:", err);
    } finally {
      setExportLoading(false);
    }
  };

  // Ref для отслеживания ожидаемой страницы (после клика пользователя)
  const expectedPageRef = useRef<number | null>(null);
  // Ref для таймера сброса expectedPageRef
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Модель пагинации — мемоизирована для стабильной ссылки
  const paginationModel = useMemo(() => ({ page, pageSize }), [page, pageSize]);

  // Функция сброса expectedPageRef с задержкой
  const scheduleExpectedPageReset = useCallback((expectedPage: number) => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      // Сбрасываем expectedPageRef только если страница всё ещё та же самая
      // И данные уже загрузились (leaders.length > 0 или totalCount > 0)
      if (expectedPageRef.current === expectedPage && (leaders.length > 0 || totalCount > 0)) {
        console.log('[DataGrid] Page synchronized (delayed), resetting expectedPageRef');
        expectedPageRef.current = null;
      }
    }, 500); // Увеличил до 500мс для надёжности
  }, [leaders.length, totalCount]);

  // Обработчик пагинации — обновляем только наш state
  const handlePaginationModelChange = useCallback((model: GridPaginationModel) => {
    console.log('[DataGrid] onPaginationModelChange:', model, 'current page:', page, 'expectedPage:', expectedPageRef.current, 'leaders.length:', leaders.length);
    
    // Если DataGrid пытается сбросить страницу, но мы ожидаем другую — игнорируем
    if (expectedPageRef.current !== null && model.page !== expectedPageRef.current) {
      console.log('[DataGrid] 🚫 Blocking reverse reset: expected', expectedPageRef.current, 'got', model.page);
      return;
    }
    
    // Дополнительная защита: если мы на странице > 0, данные загружены, и DataGrid пытается сбросить на 0 — игнорируем
    if (page > 0 && model.page === 0 && leaders.length > 0) {
      console.log('[DataGrid] 🚫 Blocking late reset: page', page, '-> 0 with data loaded');
      return;
    }
    
    if (model.page !== page) {
      console.log('[DataGrid] ✅ Setting page:', model.page);
      expectedPageRef.current = model.page;
      setPage(model.page);
      // Планируем сброс expectedPageRef с задержкой
      scheduleExpectedPageReset(model.page);
    }
    if (model.pageSize !== pageSize) {
      console.log('[DataGrid] Setting pageSize:', model.pageSize);
      setPageSize(model.pageSize);
    }
  }, [page, pageSize, setPage, setPageSize, scheduleExpectedPageReset, leaders.length]);

  // Cleanup таймера при размонтировании
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  // Отладка: лог при изменении page
  useEffect(() => {
    console.log('[DataGrid] page changed to:', page, 'leaders.length:', leaders.length, 'totalCount:', totalCount, 'expectedPageRef:', expectedPageRef.current);
  }, [page, leaders.length, totalCount]);

  // Отладка: лог при монтировании/размонтировании компонента
  useEffect(() => {
    console.log('[DataGrid] Component mounted');
    return () => {
      console.log('[DataGrid] Component unmounting');
    };
  }, []);

  // Сброс пагинации на страницу 0 при изменении любых фильтров
  const prevFiltersRef = useRef<DashboardFilters | null>(null);
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const current = filters;
    if (
      !prev ||
      prev.gradeMin !== current.gradeMin ||
      prev.domain !== current.domain ||
      prev.critical !== current.critical ||
      prev.hasSuccessor !== current.hasSuccessor ||
      prev.searchName !== current.searchName ||
      prev.positionFilter !== current.positionFilter
    ) {
      prevFiltersRef.current = current;
      if (page !== 0) {
        console.log('[Filters] Resetting page to 0 due to filter change');
        setPage(0);
      }
    }
  }, [filters, page, setPage]);

  // Модель сортировки
  const sortModel: GridSortModel = sortField
    ? [{ field: sortField, sort: sortOrder ?? "asc" }]
    : [];

  const handleSortModelChange = (model: GridSortModel) => {
    if (model.length > 0) {
      const { field, sort } = model[0];
      const mappedField = FIELD_MAP[field];
      if (mappedField) {
        setSortField(mappedField);
        setSortOrder(sort === "desc" ? "desc" : "asc");
      }
    } else {
      setSortField(undefined);
      setSortOrder(undefined);
    }
    setPage(0);
  };

  if (leadersError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={<Button onClick={() => refetchLeaders()}>Повторить</Button>}>
          Ошибка загрузки данных. Проверьте подключение.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        gap: 1,
      }}
    >
      {/* Фильтры */}
      <FiltersBar
        filteredNameOptions={filteredNameOptions}
        filteredPositionOptions={filteredPositionOptions}
        filteredDomainOptions={filteredDomainOptions}
      />

      {/* Кнопка экспорта в Excel */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportExcel}
          disabled={exportLoading || leadersLoading}
        >
          {exportLoading ? "Подготовка..." : "Экспорт в Excel"}
        </Button>
      </Box>

      {/* Таблица руководителей */}
      <Box sx={{ width: "100%" }}>
        {selectedLeader ? (
          /* Показываем одну строку с выбранным руководителем */
          <Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
              <Button variant="outlined" size="small" onClick={handleResetSelection}>
                Сбросить выбор
              </Button>
            </Box>
            <DataGrid
              rows={[selectedLeader]}
              columns={leaderColumns}
              getRowId={(row) => row.fullName}
              loading={false}
              localeText={{ ...gridLocaleRu, noRowsLabel: "Нет результатов" }}
              rowHeight={40}
              disableColumnMenu
              disableRowSelectionOnClick
              hideFooterSelectedRowCount
              columnHeaderHeight={46}
              sx={{
                "& .MuiDataGrid-columnHeaders, & .MuiDataGrid-container--top": {
                  backgroundColor: LEADERS_HEADER_BG,
                },
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: LEADERS_HEADER_BG,
                  color: HEADER_TEXT_COLOR,
                },
                "& .MuiDataGrid-columnHeaders .MuiDataGrid-filler, & .MuiDataGrid-container--top .MuiDataGrid-filler": {
                  backgroundColor: LEADERS_HEADER_BG,
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  color: HEADER_TEXT_COLOR,
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
              }}
            />
          </Box>
        ) : (
          /* Полная таблица */
          <DataGrid
            rows={leaders}
            columns={leaderColumns}
            getRowId={(row) => row.fullName}
            loading={leadersLoading || leadersFetching}
            localeText={{ ...gridLocaleRu, noRowsLabel: "Нет результатов" }}
            rowHeight={40}
            // ─── Серверная пагинация ───
            pagination={true}
            paginationMode="server"
            rowCount={totalCount}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[10, 20, 50, 100]}
            // ─── Серверная сортировка ───
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            // ─── Внешний вид ───
            disableColumnMenu
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
            onRowClick={(params) => handleSelectLeader(params.row)}
            columnHeaderHeight={46}
            sx={{
              "& .MuiDataGrid-columnHeaders, & .MuiDataGrid-container--top": {
                backgroundColor: LEADERS_HEADER_BG,
              },
              "& .MuiDataGrid-columnHeader": {
                backgroundColor: LEADERS_HEADER_BG,
                color: HEADER_TEXT_COLOR,
              },
              "& .MuiDataGrid-columnHeaders .MuiDataGrid-filler, & .MuiDataGrid-container--top .MuiDataGrid-filler": {
                backgroundColor: LEADERS_HEADER_BG,
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                color: HEADER_TEXT_COLOR,
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
            }}
          />
        )}
      </Box>

      {/* Детали выбранного руководителя */}
      {selectedLeader && (
        <Box>
          <Accordion expanded={isListExpanded} onChange={() => setIsListExpanded(!isListExpanded)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Детали: {selectedLeader.fullName}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {detailLoading ? (
                <Typography>Загрузка деталей...</Typography>
              ) : detailError ? (
                <Alert severity="error">Ошибка загрузки деталей.</Alert>
              ) : managerDetail ? (
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
                  succLoading={successorsLoading}
                  succError={succError}
                  refetchSucc={refetchSucc}
                />
              ) : (
                <Typography>Данные не найдены.</Typography>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </Box>
  );
}
