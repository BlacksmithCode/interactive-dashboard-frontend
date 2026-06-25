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
import { colors } from "@/shared/theme/tokens";

const LEADERS_HEADER_BG = colors.redAccent;
const HEADER_TEXT_COLOR = colors.white;

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
    leaders,
    totalCount,
    leadersLoading,
    leadersFetching,
    leadersError,
    refetchLeaders,
    page,
    setPage,
    pageSize,
    setPageSize,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    selectedLeader,
    handleSelectLeader,
    handleResetSelection,
    isListExpanded,
    setIsListExpanded,
    filteredNameOptions,
    filteredPositionOptions,
    filteredDomainOptions,
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

  const expectedPageRef = useRef<number | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const paginationModel = useMemo(() => ({ page, pageSize }), [page, pageSize]);

  const scheduleExpectedPageReset = useCallback((expectedPage: number) => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      if (expectedPageRef.current === expectedPage && (leaders.length > 0 || totalCount > 0)) {
        expectedPageRef.current = null;
      }
    }, 500);
  }, [leaders.length, totalCount]);

  const handlePaginationModelChange = useCallback((model: GridPaginationModel) => {
    if (expectedPageRef.current !== null && model.page !== expectedPageRef.current) {
      return;
    }
    if (page > 0 && model.page === 0 && leaders.length > 0) {
      return;
    }
    if (model.page !== page) {
      expectedPageRef.current = model.page;
      setPage(model.page);
      scheduleExpectedPageReset(model.page);
    }
    if (model.pageSize !== pageSize) {
      setPageSize(model.pageSize);
    }
  }, [page, pageSize, setPage, setPageSize, scheduleExpectedPageReset, leaders.length]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

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
        setPage(0);
      }
    }
  }, [filters, page, setPage]);

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

  const dataGridSx = {
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
      fontWeight: "bold" as const,
    },
    "& .MuiDataGrid-columnHeaders .MuiIconButton-root, & .MuiDataGrid-columnHeaders .MuiSvgIcon-root": {
      color: HEADER_TEXT_COLOR,
      backgroundColor: "transparent !important" as const,
    },
    "& .MuiDataGrid-columnHeaders .MuiSvgIcon-root path": {
      fill: HEADER_TEXT_COLOR,
    },
    "& .MuiDataGrid-columnSeparator": {
      color: colors.greyDivider,
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
  };

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
      <FiltersBar
        filteredNameOptions={filteredNameOptions}
        filteredPositionOptions={filteredPositionOptions}
        filteredDomainOptions={filteredDomainOptions}
      />

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

      <Box sx={{ width: "100%" }}>
        {selectedLeader ? (
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
              sx={dataGridSx}
            />
          </Box>
        ) : (
          <DataGrid
            key={`page-${page}`}
            rows={leaders}
            columns={leaderColumns}
            getRowId={(row) => row.fullName}
            loading={leadersLoading || leadersFetching}
            localeText={{ ...gridLocaleRu, noRowsLabel: "Нет результатов" }}
            rowHeight={40}
            pagination={true}
            paginationMode="server"
            rowCount={totalCount}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            pageSizeOptions={[10, 20, 50, 100]}
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            disableColumnMenu
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
            onRowClick={(params) => handleSelectLeader(params.row)}
            columnHeaderHeight={46}
            sx={dataGridSx}
          />
        )}
      </Box>

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