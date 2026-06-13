// src/features/dashboard/widgets/LeadersSuccessors.tsx

import { Box, Alert, Button, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { Theme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import { useSearchParams } from "react-router-dom";
import { DashboardFiltersProvider, useLeadersSuccessors } from "@/features/dashboard";
import { gridLocaleRu } from "@/shared/config/locales/gridLocaleRu";
import { ROLES } from "@/entities/user";
import { getRowClassName } from "../lib/utils";
import { leaderColumns } from "../config/columns";
import { FiltersBar } from "./FiltersBar";
import { LeaderDetails } from "./LeaderDetails";

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
    role,
    leadersLoading,
    leadersError,
    refetchLeaders,
    filteredNameOptions,
    filteredPositionOptions,
    filteredDomainOptions,
    filteredLeaders,
    availableCriticalOptions,
    availableSuccessorOptions,
    selectedLeader,
    isListExpanded,
    setIsListExpanded,
    team,
    teamLoading,
    teamError,
    refetchTeam,
    successors,
    succLoading,
    succError,
    refetchSucc,
    managerDetail,
    detailLoading,
    detailError,
    handleRowClick,
    handleResetSelection,
  } = useLeadersSuccessors();

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