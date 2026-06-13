import { type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";
import { Box, IconButton, Select, MenuItem, Chip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ROLE_NAMES, updateUserRole, toggleUserBlock, deleteUser } from "@/entities/user";

interface AdminColumnsProps {
  onUsersChange: () => void;
  currentUsername: string | null;
  onError: (message: string) => void;
}

export const getAdminColumns = ({ onUsersChange, currentUsername, onError }: AdminColumnsProps): GridColDef[] => [
  { field: "id", headerName: "ID", width: 70 },
  { field: "username", headerName: "Логин", width: 130 },
  { field: "fullName", headerName: "ФИО", flex: 1, minWidth: 200 },
  { field: "domain", headerName: "Домен", width: 150 },
  { 
    field: "role", 
    headerName: "Роль", 
    width: 180,
    renderCell: (params: GridRenderCellParams) => (
      <Select
        value={params.value || ""}
        size="small"
        onChange={async (e) => {
          try {
            await updateUserRole(params.row.id, e.target.value as string);
            onUsersChange();
          } catch (error) {
            console.error(error);
            onError("Ошибка при обновлении роли");
          }
        }}
        sx={{ width: '100%', height: 35 }}
      >
        {Object.entries(ROLE_NAMES).map(([key, name]) => (
          <MenuItem key={key} value={key}>{name}</MenuItem>
        ))}
      </Select>
    )
  },
  { 
    field: "active", 
    headerName: "Статус", 
    width: 120,
    renderCell: (params: GridRenderCellParams) => (
      <Chip 
        label={params.value ? "Активен" : "Заблокирован"} 
        color={params.value ? "success" : "error"} 
        size="small" 
      />
    )
  },
  {
    field: "actions",
    headerName: "Действия",
    width: 120,
    renderCell: (params: GridRenderCellParams) => (
      <Box>
        <IconButton 
          disabled={params.row.username === currentUsername}
          onClick={async () => {
            try {
              await toggleUserBlock(params.row.id);
              onUsersChange();
            } catch (error) {
              console.error(error);
              onError("Нельзя заблокировать свой собственный аккаунт!");
            }
          }} 
          color={params.row.active ? "warning" : "success"}
          title={params.row.active ? "Заблокировать" : "Разблокировать"}
        >
          {params.row.active ? <BlockIcon /> : <CheckCircleIcon />}
        </IconButton>
        <IconButton 
          disabled={params.row.username === currentUsername}
          onClick={async () => {
            if (window.confirm(`Вы уверены, что хотите безвозвратно удалить пользователя ${params.row.username}?`)) {
              try {
                await deleteUser(params.row.id);
                onUsersChange();
              } catch (error) {
                console.error(error);
                onError("Нельзя удалить свой собственный аккаунт!");
              }
            }
          }} 
          color="error"
          title="Удалить"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    )
  }
];