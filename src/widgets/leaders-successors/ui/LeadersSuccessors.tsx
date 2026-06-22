// src/features/dashboard/widgets/LeadersSuccessors.tsx

import { Box, Alert, Button, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DataGrid, type GridSortModel, type GridPaginationModel } from "@mui/x-data-grid";
import { useSearchParams } from "react-router-dom";
import { DashboardFiltersProvider, useLeadersSuccessors, FIELD_MAP } from "@/features/dashboard";
import { gridLocaleRu } from "@/shared/config/locales/gridLocaleRu";
import { getRowClassName } from "../lib/utils";
import { leaderColumns } from "../config/columns";
import { FiltersBar } from "./FiltersBar";
import { LeaderDetails } from "./LeaderDetails";
import {useMemo} from "react";

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
  const {
    // Список
    leaders,
    totalCount,
    leadersLoading,
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

    // Фильтры
    filteredNameOptions,
    filteredPositionOptions,
    filteredDomainOptions,
    availableCriticalOptions,
    availableSuccessorOptions,

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

  // 1. Модель пагинации остается мемоизированной
  const paginationModel = useMemo(() => ({
    page,
    pageSize,
  }), [page, pageSize]);

  // 2. Умный обработчик пагинации с защитой от ложного сброса
  const handlePaginationModelChange = (model: GridPaginationModel) => {    
    // Если мы находимся на странице больше 0, и DataGrid пытается сбросить нас в 0
    // при неизменном размере страницы — это ложный внутренний триггер MUI. Блокируем его.
    if (page > 0 && model.page === 0 && model.pageSize === pageSize) {
      return;
    }

    if (model.page !== page) {
      setPage(model.page);
    }
    if (model.pageSize !== pageSize) {
      setPageSize(model.pageSize);
    }
  };

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
        availableCriticalOptions={availableCriticalOptions}
        availableSuccessorOptions={availableSuccessorOptions}
      />

      {/* Таблица руководителей */}
      <Box
        sx={{
          width: "100%",
          "& .header-red": {
            backgroundColor: LEADERS_HEADER_BG,
            color: HEADER_TEXT_COLOR,
            "& .MuiSvgIcon-root": { color: HEADER_TEXT_COLOR },
          },
        }}
      >
        <DataGrid
          rows={leaders}
          columns={leaderColumns}
          getRowId={(row) => row.fullName}
          loading={leadersLoading}
          localeText={gridLocaleRu}
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
          getRowClassName={(params) => getRowClassName(params)}
          onRowClick={(params) => handleSelectLeader(params.row)}
          columnHeaderHeight={46}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: LEADERS_HEADER_BG,
              color: HEADER_TEXT_COLOR,
            },
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: LEADERS_HEADER_BG,
              color: HEADER_TEXT_COLOR,
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              color: HEADER_TEXT_COLOR,
              fontWeight: "bold",
            },
            "& .MuiDataGrid-sortIcon": {
              color: HEADER_TEXT_COLOR,
            },
            "& .MuiDataGrid-menuIconButton": {
              color: HEADER_TEXT_COLOR,
            },
            "& .MuiDataGrid-row:hover": {
              cursor: "pointer",
            },
          }}
        />
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
