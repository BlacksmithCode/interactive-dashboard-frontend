import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useAuditLogs } from "../hooks/useAuditLogs";
import { gridLocaleRu } from "@/shared/config/locales/gridLocaleRu";
import type { AuditLog } from "../api/auditApi";

const ACTION_OPTIONS = [
  { value: "LOGIN", label: "Вход" },
  { value: "LOGOUT", label: "Выход" },
  { value: "ROLE_CHANGE", label: "Смена роли" },
  { value: "BLOCK", label: "Блокировка" },
  { value: "UNBLOCK", label: "Разблокировка" },
];

export function AuditLogTable() {
  const { logs, isLoading, page, setPage, pageSize, setPageSize, filters, setFilters, totalCount } = useAuditLogs();

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(0);
  };

  const columns: GridColDef[] = [
    {
      field: "timestamp",
      headerName: "Время",
      flex: 1,
      minWidth: 180,
      valueFormatter: (value: string) => {
        return new Date(value).toLocaleString("ru-RU", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      },
    },
    {
      field: "username",
      headerName: "Пользователь",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "action",
      headerName: "Действие",
      flex: 1,
      minWidth: 120,
      valueFormatter: (value: string) => {
        const action = ACTION_OPTIONS.find(a => a.value === value);
        return action?.label || value;
      },
    },
    {
      field: "target",
      headerName: "Объект",
      flex: 2,
      minWidth: 200,
    },
    {
      field: "details",
      headerName: "Детали",
      flex: 2,
      minWidth: 200,
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
      {/* Фильтры */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          label="Дата с"
          type="datetime-local"
          value={filters.from || ""}
          onChange={(e) => handleFilterChange("from", e.target.value)}
          size="small"
          variant="outlined"
          sx={{ minWidth: 200 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="Дата по"
          type="datetime-local"
          value={filters.to || ""}
          onChange={(e) => handleFilterChange("to", e.target.value)}
          size="small"
          variant="outlined"
          sx={{ minWidth: 200 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Действие</InputLabel>
          <Select
            value={filters.action || ""}
            label="Действие"
            onChange={(e) => handleFilterChange("action", e.target.value)}
          >
            <MenuItem value="">Все</MenuItem>
            {ACTION_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Пользователь"
          value={filters.username || ""}
          onChange={(e) => handleFilterChange("username", e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        />
        <Button variant="outlined" onClick={handleClearFilters}>
          Сбросить
        </Button>
      </Box>

      {/* Таблица */}
      <Box sx={{ flexGrow: 1, minHeight: 400, bgcolor: "background.paper", borderRadius: 1, boxShadow: 1 }}>
        <DataGrid
          rows={logs.map((log: AuditLog, index: number) => ({ ...log, id: log.id || index }))}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          localeText={gridLocaleRu}
          paginationMode="server"
          rowCount={totalCount}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          pageSizeOptions={[20, 50, 100]}
        />
      </Box>
    </Box>
  );
}
