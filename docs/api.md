# Документация API

## Обзор

API-слой проекта построен на основе Axios с централизованной обработкой ошибок, авторизацией и типизацией. Все API-вызовы проходят через единый HTTP-клиент с поддержкой JWT-авторизации.

## Базовый HTTP-клиент

### Инициализация

```typescript
import { api } from "@/shared/api/apiClient";

// Базовый URL автоматически определяется из окружения
// В dev: относительный путь через Vite-прокси
// В prod: из VITE_API_BASE_URL
```

### Конфигурация

```typescript
export const api = axios.create({
  baseURL, // Автоматически определяется
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});
```

## Авторизация

### Управление токеном

```typescript
import { setAuthToken, getAuthHeader, removeAuthToken } from "@/entities/user/model/token";

// Установка токена
setAuthToken("jwt_token_here");

// Получение заголовка авторизации
const authHeader = getAuthHeader(); // "Bearer jwt_token_here"

// Удаление токена
removeAuthToken();
```

### Интеграция с API-клиентом

```typescript
import { setTokenProvider } from "@/shared/api/apiClient";

// Установка провайдера токена
setTokenProvider(getAuthHeader);
```

## Обработка ошибок

### Нормализация ошибок

Все ошибки API нормализуются в единый формат:

```typescript
interface NormalizedError {
  message: string;
  statusCode: number;
  isNetworkError: boolean;
}
```

### Пример обработки

```typescript
try {
  const response = await api.get("/api/data");
} catch (error) {
  const normalizedError = error as NormalizedError;
  console.error(normalizedError.message);
}
```

## API-модули

### Dashboard API

```typescript
import { fetchStats, fetchNineBox, fetchDomainGist } from "@/entities/dashboard";

// Получение статистики
const stats = await fetchStats({
  gradeMin: 5,
  domain: "IT",
  critical: true,
});

// Получение 9-box матрицы
const nineBox = await fetchNineBox(filters);

// Получение сводки по доменам
const gist = await fetchDomainGist({ gradeMin: 5 });
```

### Users API

```typescript
import { 
  loginUser, 
  registerUser, 
  fetchUsers, 
  updateUserRole,
  toggleUserBlock 
} from "@/entities/user/api/usersApi";

// Вход в систему
const authData = await loginUser("username", "password");

// Регистрация пользователя
await registerUser({
  username: "newuser",
  password: "SecurePass123!",
  fullName: "Иван Иванов",
  domain: "IT",
  role: "ROLE_MANAGER",
});

// Получение списка пользователей
const users = await fetchUsers();

// Изменение роли
await updateUserRole(userId, "ROLE_ADMIN");

// Блокировка/разблокировка
await toggleUserBlock(userId);
```

### Leaders API

```typescript
import { 
  fetchLeaders, 
  fetchManagerSuccessors,
  fetchManagerDetail,
  fetchManagerTeam 
} from "@/entities/leader/api/leadersApi";

// Получение списка руководителей
const leaders = await fetchLeaders(
  { grade: 5, critical: true },
  { page: 0, pageSize: 20, sortField: "fullName", sortOrder: "asc" }
);

// Получение преемников руководителя
const successors = await fetchManagerSuccessors("Иванов Иван Иванович");

// Получение деталей руководителя
const details = await fetchManagerDetail("Иванов Иван Иванович");

// Получение команды руководителя
const team = await fetchManagerTeam("Иванов Иван Иванович");
```

### Export API

```typescript
import { downloadExcelExport, downloadPdfExport } from "@/features/dashboard/api/export";

// Экспорт в Excel
const excelBlob = await downloadExcelExport({
  gradeMin: 5,
  domain: "IT",
  critical: true,
});

// Экспорт в PDF
const pdfBlob = await downloadPdfExport({
  gradeMin: 5,
  domain: "IT",
});
```

### Admin API

```typescript
import { fetchAuditLogs } from "@/features/admin/api/auditApi";

// Получение журнала аудита
const auditLogs = await fetchAuditLogs({
  from: "2023-01-01",
  to: "2023-12-31",
  action: "LOGIN",
  page: 0,
  size: 20,
});
```

## Типы данных

### Dashboard типы

```typescript
// Ответ статистики
interface StatsResponse {
  managersWithSuccessors: number;
  managersWithoutSuccessors: number;
  criticalRoles: number;
  criticalRolesWithSuccessors: number;
  criticalRolesWithoutSuccessors: number;
  nonCriticalRoles: number;
  nonCriticalRolesWithSuccessors: number;
  nonCriticalRolesWithoutSuccessors: number;
}

// 9-box матрица
interface NineBoxResponse {
  totalManagers: number;
  cells: Record<NineBoxKey, NineBoxCell>;
}

// Фильтры дашборда
interface DashboardFilters {
  gradeMin?: number;
  domain?: string;
  critical?: boolean;
  hasSuccessor?: boolean;
  searchName?: string;
  positionFilter?: string;
}
```

### User типы

```typescript
// Ответ авторизации
interface AuthResponse {
  token: string;
  username: string;
  role: string;
  fullName?: string;
  active?: boolean;
}

// Данные пользователя
interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  domain: string;
  role: string;
  active: boolean;
  createdAt: string;
}
```

### Leader типы

```typescript
// Элемент списка руководителей
interface ManagerListItem {
  fullName: string;
  domain: string;
  position: string;
  grade: number;
  critical: boolean;
  hasSuccessor: boolean;
  assessment360?: string;
  era?: string;
  developmentProgram?: string;
  careerStatus?: string;
  potential?: string;
  performance?: string;
  box?: string;
  boxInterpretation?: string;
}

// Пагинированный ответ
interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
}
```

## Конфигурация запросов

### Параметры пагинации

```typescript
interface ServerPaginationParams {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: SortOrder;
}
```

### Форматирование параметров

```typescript
// Пример формирования URL-параметров
const params = new URLSearchParams();
if (filters.gradeMin !== undefined) {
  params.append("grade", filters.gradeMin.toString());
}
if (filters.domain) {
  params.append("domains", filters.domain);
}
```

## Кэширование

### TanStack Query

API-слой интегрирован с TanStack Query для кэширования:

```typescript
// Пример хука с кэшированием
export function useStatsQuery(filters: DashboardFilters) {
  return useQuery({
    queryKey: ["stats", filters],
    queryFn: () => fetchStats(filters),
    staleTime: 5 * 60 * 1000, // 5 минут
    cacheTime: 10 * 60 * 1000, // 10 минут
  });
}
```

### Инвалидация кэша

```typescript
// Инвалидация по ключу
queryClient.invalidateQueries({ queryKey: ["stats"] });

// Инвалидация по предикату
queryClient.invalidateQueries({
  predicate: (query) => query.queryKey[0] === "stats",
});
```

## Обработка специальных случаев

### 401 Неавторизован

Автоматическая обработка 401 ошибок с перенаправлением на страницу входа:

```typescript
// Установка обработчика
setOnUnauthorizedHandler(() => {
  logout();
  window.location.href = "/login";
});
```

### 403 Доступ запрещен

Ошибки 403 не вызывают логаут, так как используются для проверки прав доступа.

### Сетевые ошибки

```typescript
// Проверка на сетевую ошибку
if (error.isNetworkError) {
  // Обработка отсутствия соединения
}
```

## Примеры использования

### Комплексный запрос с фильтрами

```typescript
const loadData = async () => {
  const filters = {
    gradeMin: 5,
    domain: "IT",
    critical: true,
    hasSuccessor: false,
  };
  
  const [stats, nineBox, leaders] = await Promise.all([
    fetchStats(filters),
    fetchNineBox(filters),
    fetchLeaders(filters, { page: 0, pageSize: 50 }),
  ]);
  
  return { stats, nineBox, leaders };
};
```

### Обработка ошибок в компоненте

```typescript
const { data, error, isLoading } = useStatsQuery(filters);

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error.message} />;
if (!data) return <NoDataMessage />;

return <DataComponent data={data} />;
```

## Рекомендации

### Типизация

- Всегда используйте типы для API-ответов
- Избегайте `any` в API-слое
- Создавайте интерфейсы для всех запросов и ответов

### Обработка ошибок

- Обрабатывайте ошибки на уровне API-клиента
- Предоставляйте meaningful сообщения об ошибках
- Логируйте ошибки для отладки

### Оптимизация

- Используйте кэширование для частых запросов
- Применяйте запросы с отложенной загрузкой
- Оптимизируйте размер передаваемых данных

## Тестирование

### Mock API

```typescript
// Пример мока для тестов
jest.mock("@/shared/api/apiClient", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Использование в тесте
api.get.mockResolvedValue({ data: mockData });
```

### Интеграционные тесты

```typescript
// Пример теста API
describe("Dashboard API", () => {
  test("should fetch stats successfully", async () => {
    const result = await fetchStats({});
    expect(result.managersWithSuccessors).toBeGreaterThan(0);
  });
});
```

---

**Автор**: Максим Местоев  
**Версия**: 1.0  
**Обновлено**: 2026-06-26