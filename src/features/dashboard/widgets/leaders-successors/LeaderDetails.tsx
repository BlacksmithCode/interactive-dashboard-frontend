import {
  Box,
  Typography,
  Alert,
  Button,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { ManagerListItem, ManagerDetail, Successor, TeamMemberDto } from "../../../../types/dashboard";
import { gridLocaleRu } from "../../../../locales/gridLocaleRu";
import { teamColumns, successorColumns } from "./columns";
import { capitalizeFirstLetter } from "./utils";

interface LeaderDetailsProps {
  selectedLeader: ManagerListItem | null;
  handleResetSelection: () => void;
  managerDetail: ManagerDetail | undefined;
  detailLoading: boolean;
  detailError: boolean;
  team: TeamMemberDto[];
  teamLoading: boolean;
  teamError: boolean;
  refetchTeam: () => void;
  successors: Successor[];
  succLoading: boolean;
  succError: boolean;
  refetchSucc: () => void;
}

export const LeaderDetails = ({
  selectedLeader,
  handleResetSelection,
  managerDetail,
  detailLoading,
  detailError,
  team,
  teamLoading,
  teamError,
  refetchTeam,
  successors,
  succLoading,
  succError,
  refetchSucc,
}: LeaderDetailsProps) => {
  if (!selectedLeader) return null;

  return (
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
            localeText={gridLocaleRu}
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
            getRowId={(row) => `${row.fullName}_${row.successorStatus}`}
            pageSizeOptions={[5, 10]}
            localeText={gridLocaleRu}
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } },
            }}
          />
        </Box>
      )}
    </Box>
  );
};