import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Select, FormControl, 
  InputLabel, IconButton, Chip, Autocomplete
} from "@mui/material";
import { DataGrid, type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { 
  fetchUsers, registerUser, toggleUserBlock, deleteUser, 
  updateUserRole, type UserResponse, type RegisterRequest 
} from "../shared/api/adapters/httpAdapter";
import { ROLES } from "../shared/ui/roles";
import { RoleGuard } from "../shared/ui/RoleGuard";
import { gridLocaleRu } from "../locales/gridLocaleRu";
import { useManagerMeta } from "../features/dashboard/hooks/useManagerMeta";

// Бэкенд в этих эндпоинтах ожидает и возвращает роли без префикса "ROLE_"
const BACKEND_ROLES = {
  ADMIN: "ADMIN",
  HRD_EVALUATION: "HRD_EVALUATION",
  HRD_DOMAIN: "HRD_DOMAIN",
  MANAGER: "MANAGER",
};

const roleNames: Record<string, string> = {
  [BACKEND_ROLES.ADMIN]: "Администратор",
  [BACKEND_ROLES.HRD_EVALUATION]: "HRD Оценка",
  [BACKEND_ROLES.HRD_DOMAIN]: "HRD Домен",
  [BACKEND_ROLES.MANAGER]: "Руководитель",
};

export default function AdminPanel() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { availableDomains, allManagers } = useManagerMeta();
  const managerNames = Array.from(new Set(allManagers?.map((m) => m.fullName) || []));
  
  const [newUser, setNewUser] = useState<RegisterRequest>({
    username: "",
    password: "",
    fullName: "",
    domain: "",
    role: BACKEND_ROLES.MANAGER,
  });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (e) {
      console.error("Не удалось загрузить пользователей", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleRegister = async () => {
    try {
      await registerUser(newUser);
      setIsModalOpen(false);
      setNewUser({ username: "", password: "", fullName: "", domain: "", role: BACKEND_ROLES.MANAGER });
      loadUsers(); // Перезагружаем таблицу
    } catch (error) {
      console.error(error);
      alert("Ошибка при регистрации (возможно логин уже занят)");
    }
  };

  const columns: GridColDef[] = [
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
            await updateUserRole(params.row.id, e.target.value as string);
            loadUsers();
          }}
          sx={{ width: '100%', height: 35 }}
        >
          {Object.entries(roleNames).map(([key, name]) => (
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
            onClick={async () => {
              await toggleUserBlock(params.row.id);
              loadUsers();
            }} 
            color={params.row.active ? "warning" : "success"}
            title={params.row.active ? "Заблокировать" : "Разблокировать"}
          >
            {params.row.active ? <BlockIcon /> : <CheckCircleIcon />}
          </IconButton>
          <IconButton 
            onClick={async () => {
              if (confirm(`Вы уверены, что хотите безвозвратно удалить пользователя ${params.row.username}?`)) {
                try {
                  await deleteUser(params.row.id);
                  loadUsers();
              } catch (error) {
                console.error(error);
                  alert("Нельзя удалить свой собственный аккаунт!");
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

  return (
    <RoleGuard allowedRoles={[ROLES.ADMIN]}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Управление пользователями
          </Typography>
          <Button variant="contained" onClick={() => setIsModalOpen(true)}>Добавить пользователя</Button>
        </Box>
        
        <Box sx={{ flexGrow: 1, minHeight: 500, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
          <DataGrid
            rows={users}
            columns={columns}
            loading={isLoading}
            disableRowSelectionOnClick
            localeText={gridLocaleRu}
            initialState={{
              pagination: { paginationModel: { pageSize: 15 } },
            }}
            pageSizeOptions={[15, 50, 100]}
          />
        </Box>

        {/* Модальное окно регистрации */}
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Регистрация пользователя</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '20px !important' }}>
            <TextField label="Логин" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} fullWidth />
            <TextField label="Пароль" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} fullWidth />
            <Autocomplete
              freeSolo
              options={managerNames}
              inputValue={newUser.fullName}
              onInputChange={(_, newInputValue) => {
                setNewUser(prev => {
                  const newState = { ...prev, fullName: newInputValue };
                  // Автоматически подставляем домен, если нашли совпадение по ФИО
                  const manager = allManagers?.find(m => m.fullName === newInputValue);
                  if (manager && manager.domain) newState.domain = manager.domain;
                  return newState;
                });
              }}
              renderInput={(params) => <TextField {...params} label="ФИО" fullWidth />}
            />
            <Autocomplete
              freeSolo
              options={availableDomains}
              inputValue={newUser.domain}
              onInputChange={(_, newInputValue) => setNewUser({...newUser, domain: newInputValue})}
              renderInput={(params) => <TextField {...params} label="Домен" fullWidth />}
            />
            <FormControl fullWidth>
              <InputLabel>Роль</InputLabel>
              <Select value={newUser.role} label="Роль" onChange={e => setNewUser({...newUser, role: e.target.value})}>
                {Object.entries(roleNames).map(([key, name]) => (
                  <MenuItem key={key} value={key}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setIsModalOpen(false)}>Отмена</Button>
            <Button onClick={handleRegister} variant="contained" disabled={!newUser.username || !newUser.password || !newUser.fullName}>
              Создать
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </RoleGuard>
  );
}