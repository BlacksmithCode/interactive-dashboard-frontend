import { useMemo } from "react";
import { gridLocaleRu } from "@/shared/config/locales/gridLocaleRu";
import { Box, Typography, Alert, Button } from "@mui/material";
import { DataGrid, type GridColDef, type GridRowParams } from "@mui/x-data-grid";
import { useLeadersQuery } from "../hooks";
import { useDashboardFilters } from "../model/useDashboardFilters";
import type { ManagerListItem } from "@/entities/leader";

const columns: GridColDef<ManagerListItem>[] = [
  { field: "position", headerName: "Должность", flex: 1, minWidth: 200 },
  { field: "fullName", headerName: "ФИО", flex: 1, minWidth: 180 },
  { field: "domain", headerName: "Домен", width: 160 },
  { field: "grade", headerName: "Грейд", width: 80, align: "center", headerAlign: "center" },
  {
    field: "hasSuccessor",
    headerName: "Преемник",
    width: 120,
    align: "center",
    headerAlign: "center",
    renderCell: (params) => (params.value ? "Да" : "Нет"),
  },
];

function getRowClassName(params: GridRowParams<ManagerListItem>): string {
  return params.row.hasSuccessor ? "" : "critical-row--no-successor";
}

export function CriticalRolesPanel() {
  const { filters } = useDashboardFilters();
  const queryParams = { 
    critical: true, 
    gradeMin: filters.gradeMin,
    domains: filters.domain ? [filters.domain] : undefined 
  };

  const { data: paginatedData, isLoading, isError, refetch } = useLeadersQuery(queryParams, { pageSize: 100 });
  const leaders = paginatedData?.items ?? [];

  const summary = useMemo(() => {
    const total = leaders.length;
    const without = leaders.filter((l) => !l.hasSuccessor).length;
    return { total, without };
  }, [leaders]);

  if (isLoading) {
    return <Typography variant="body2">Загрузка критичных ролей…</Typography>;
  }

  if (isError) {
    return (
      <Alert severity="error" action={<Button size="small" onClick={() => refetch()}>Повторить</Button>}>
        Ошибка загрузки критичных ролей
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Критичные роли
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Всего критичных ролей: {summary.total}, из них без преемников: {summary.without}
      </Typography>
      <Box sx={{ width: "100%", height: 400 }}>
        <DataGrid
          rows={leaders}
          columns={columns}
          getRowId={(row) => row.fullName}
          getRowClassName={getRowClassName}
          pageSizeOptions={[10, 25, 50]}
          localeText={gridLocaleRu}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          sx={{
            "& .critical-row--no-successor": {
              backgroundColor: "rgba(255, 0, 0, 0.05)",
              "&:hover": { backgroundColor: "rgba(255, 0, 0, 0.1)" },
            },
            // Убираем синее выделение при клике
            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
              outline: "none",
            },
            "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
              outline: "none",
            },
          }}
        />
      </Box>
    </Box>
  );
}