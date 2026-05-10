import { useState } from "react";
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Grid,
  Alert,
  Button,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useLeadersQuery } from "../../features/dashboard/hooks/useLeadersQuery";
import { useSuccessorsQuery } from "../../features/dashboard/hooks/useSuccessorsQuery";
import type { ManagerListItem, Successor } from "../../types/dashboard";

const successorColumns: GridColDef<Successor>[] = [
  { field: "fullName", headerName: "ФИО преемника", width: 200 },
  { field: "queue", headerName: "Очередь", width: 80 },
  { field: "readiness", headerName: "Готовность", width: 120 },
  { field: "successorStatus", headerName: "Статус", width: 130 },
  { field: "declarant", headerName: "Заявитель", width: 180 },
  { field: "assessment360", headerName: "Оценка 360", width: 120 },
  { field: "performance", headerName: "Результативность", width: 140 },
  { field: "potential", headerName: "Потенциал", width: 100 },
  { field: "era", headerName: "Эра", width: 100 },
  { field: "developmentProgram", headerName: "Программа развития", width: 180 },
  { field: "comments", headerName: "Комментарии", width: 200 },
  { field: "careerStage", headerName: "Карьерный этап", width: 140 },
  { field: "isApproved", headerName: "Согласован", width: 110 },
  { field: "approvedBy", headerName: "Кем согласован", width: 150 },
  { field: "approvalDate", headerName: "Дата согласования", width: 130 },
];

export default function LeadersSuccessors() {
  const [selectedLeader, setSelectedLeader] = useState<ManagerListItem | null>(null);

  const { data: leaders, isLoading: leadersLoading, isError: leadersError, refetch: refetchLeaders } = useLeadersQuery();
  const { data: successors, isLoading: succLoading, isError: succError, refetch: refetchSucc } =
    useSuccessorsQuery(selectedLeader?.fullName);

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Autocomplete
            options={leaders ?? []}
            loading={leadersLoading}
            getOptionLabel={(option) => `${option.fullName} (${option.position})`}
            onChange={(_, value) => setSelectedLeader(value)}
            isOptionEqualToValue={(option, value) => option.fullName === value.fullName}
            filterOptions={(options, { inputValue }) =>
              options.filter((o) =>
                o.fullName.toLowerCase().includes(inputValue.toLowerCase())
              )
            }
            renderInput={(params) => (
              <TextField {...params} label="Поиск руководителя" variant="outlined" />
            )}
            noOptionsText="Ничего не найдено"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          {leadersError && (
            <Alert severity="error" action={<Button size="small" onClick={() => refetchLeaders()}>Повторить</Button>}>
              Ошибка загрузки списка руководителей
            </Alert>
          )}
        </Grid>
      </Grid>

      {selectedLeader && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {selectedLeader.fullName} — {selectedLeader.position}
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Преемники</Typography>
          {succLoading && <Typography>Загрузка...</Typography>}
          {succError && (
            <Alert severity="error" action={<Button size="small" onClick={() => refetchSucc()}>Повторить</Button>}>
              Ошибка загрузки преемников
            </Alert>
          )}
          {successors && (
            <DataGrid
              rows={successors}
              columns={successorColumns}
              getRowId={(row) => `${row.fullName}_${row.queue}`}
              autoHeight
            />
          )}
        </Box>
      )}
    </Box>
  );
}