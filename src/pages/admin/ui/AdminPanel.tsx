import { useState } from "react";
import { 
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Select, FormControl, 
  InputLabel, Autocomplete, Snackbar, Alert, Tabs, Tab
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ROLES, ROLE_NAMES, RoleGuard } from "@/entities/user";
import { gridLocaleRu } from "@/shared/config/locales/gridLocaleRu";
import { useManagerMeta, useLeadersQuery } from "@/features/dashboard";
import { useAdminPanel, getAdminColumns, AuditLogTable } from "@/features/admin";

type AdminTab = "users" | "audit";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>("users");

  const {
    users,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    newUser,
    setNewUser,
    loadUsers,
    handleRegister,
    error,
    success,
    onError,
    onSuccess,
  } = useAdminPanel();

  const { availableDomains } = useManagerMeta();
  const { data: allManagersData } = useLeadersQuery({}, { pageSize: 100 });
  const managerNames = Array.from(new Set(allManagersData?.items?.map((m) => m.fullName) || []));
  
  const currentUsername = localStorage.getItem("username");

  const columns = getAdminColumns({
    onUsersChange: loadUsers,
    currentUsername,
    onError,
  });

  return (
    <RoleGuard allowedRoles={[ROLES.ADMIN]}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Панель администратора
          </Typography>
          <Button variant="contained" onClick={() => setIsModalOpen(true)}>Добавить пользователя</Button>
        </Box>
        
        {/* Вкладки */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Пользователи" value="users" />
            <Tab label="Журнал аудита" value="audit" />
          </Tabs>
        </Box>

        {/* Контент вкладок */}
        {activeTab === "users" && (
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
        )}

        {activeTab === "audit" && <AuditLogTable />}

        {/* Модальное окно регистрации */}
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Регистрация пользователя</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '20px !important' }}>
            <TextField label="Логин" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} fullWidth />
            <TextField 
              label="Пароль" 
              type="password" 
              value={newUser.password} 
              onChange={e => setNewUser({...newUser, password: e.target.value})} 
              fullWidth
              helperText="Мин. 12 символов: заглавные, строчные, цифры и спецсимволы"
            />
            <Autocomplete
              freeSolo
              options={managerNames}
              inputValue={newUser.fullName}
              onInputChange={(_, newInputValue) => {
                setNewUser(prev => {
                  const newState = { ...prev, fullName: newInputValue };
                  // Автоматически подставляем домен, если нашли совпадение по ФИО
                  const manager = allManagersData?.items?.find(m => m.fullName === newInputValue);
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
                {Object.entries(ROLE_NAMES).map(([key, name]) => (
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

        {/* Уведомления */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => onError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => onError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
        
        <Snackbar open={!!success} autoHideDuration={6000} onClose={() => onSuccess(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => onSuccess(null)} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </RoleGuard>
  );
}
