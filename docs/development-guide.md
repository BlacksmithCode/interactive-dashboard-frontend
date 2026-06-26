# Руководство по разработке

## Обзор

Это руководство предназначено для разработчиков, которые будут работать с проектом Interactive Dashboard Frontend. Здесь содержатся практические инструкции, лучшие практики и рекомендации по разработке.

## Начало работы

### Требования к окружению

- Node.js 18+ 
- npm 9+
- Git
- VS Code (рекомендуется)

### Установка и запуск

```bash
# Клонирование репозитория
git clone <repository-url>
cd interactive-dashboard-frontend

# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Сборка для продакшена
npm run build

# Линтинг и проверка типов
npm run lint
npm run type-check
```

### Переменные окружения

Создайте файл `.env` в корне проекта:

```bash
# .env
VITE_API_BASE_URL=http://localhost:8080
```

## Структура проекта

### Feature-Sliced Design (FSD)

Проект следует методологии FSD с четким разделением по слоям:

```
src/
├── app/           # App слой - инициализация, роутинг, глобальные стили
├── pages/         # Pages слой - страницы приложения
├── widgets/       # Widgets слой - композиции UI
├── features/      # Features слой - бизнес-фичи
├── entities/      # Entities слой - бизнес-сущности
└── shared/        # Shared слой - переиспользуемый код
```

### Правила именования

- **Папки**: `kebab-case` (например, `leaders-successors`)
- **Файлы**: `PascalCase` для компонентов, `camelCase` для утилит
- **Экспорты**: именованные экспорты по умолчанию

## Создание новой фичи

### Шаг 1: Создание структуры

```bash
# Создание папки фичи
mkdir src/features/new-feature
cd src/features/new-feature

# Создание слоев
mkdir api
mkdir model  
mkdir ui
mkdir hooks
mkdir config
```

### Шаг 2: Реализация слоев

#### API слой (`api/`)

```typescript
// src/features/new-feature/api/newFeatureApi.ts
import { api } from "@/shared/api/apiClient";

export interface NewFeatureRequest {
  // параметры запроса
}

export interface NewFeatureResponse {
  // параметры ответа
}

export async function fetchNewFeature(params: NewFeatureRequest): Promise<NewFeatureResponse> {
  const response = await api.get<NewFeatureResponse>("/api/new-feature", { params });
  return response.data;
}
```

#### Model слой (`model/`)

```typescript
// src/features/new-feature/model/types.ts
export interface NewFeatureItem {
  id: string;
  name: string;
  // другие поля
}

// src/features/new-feature/model/useNewFeature.ts
import { useQuery } from "@tanstack/react-query";
import { fetchNewFeature } from "../api/newFeatureApi";

export function useNewFeature(params: NewFeatureRequest) {
  return useQuery({
    queryKey: ["new-feature", params],
    queryFn: () => fetchNewFeature(params),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}
```

#### UI слой (`ui/`)

```typescript
// src/features/new-feature/ui/NewFeatureComponent.tsx
import { Box, Typography } from "@mui/material";
import { useNewFeature } from "../model/useNewFeature";

interface NewFeatureComponentProps {
  // пропсы компонента
}

export function NewFeatureComponent(props: NewFeatureComponentProps) {
  const { data, isLoading, error } = useNewFeature(/* params */);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Box>
      <Typography>Новая фича</Typography>
      {/* рендер данных */}
    </Box>
  );
}
```

#### Hooks слой (`hooks/`)

```typescript
// src/features/new-feature/hooks/useNewFeatureLogic.ts
import { useCallback, useMemo } from "react";

export function useNewFeatureLogic() {
  // сложная логика компонента
  
  const handleAction = useCallback(() => {
    // обработчик действия
  }, []);

  const computedValue = useMemo(() => {
    // вычисляемое значение
    return result;
  }, [dependencies]);

  return {
    handleAction,
    computedValue,
  };
}
```

### Шаг 3: Экспорт фичи

```typescript
// src/features/new-feature/index.ts
export * from "./api/newFeatureApi";
export * from "./model/types";
export * from "./model/useNewFeature";
export * from "./ui/NewFeatureComponent";
export * from "./hooks/useNewFeatureLogic";
```

### Шаг 4: Интеграция в приложение

```typescript
// src/pages/some-page/ui/SomePage.tsx
import { NewFeatureComponent } from "@/features/new-feature";

export function SomePage() {
  return (
    <Box>
      <NewFeatureComponent />
    </Box>
  );
}
```

## Работа с API

### Создание API-метода

```typescript
// src/entities/some-entity/api/someEntityApi.ts
import { api } from "@/shared/api/apiClient";

export interface SomeEntityRequest {
  id: string;
  filter?: string;
}

export interface SomeEntityResponse {
  id: string;
  name: string;
  createdAt: string;
}

export async function fetchSomeEntity(params: SomeEntityRequest): Promise<SomeEntityResponse> {
  const response = await api.get<SomeEntityResponse>(`/api/entities/${params.id}`, {
    params: { filter: params.filter }
  });
  return response.data;
}

export async function createSomeEntity(data: Omit<SomeEntityResponse, "id" | "createdAt">): Promise<SomeEntityResponse> {
  const response = await api.post<SomeEntityResponse>("/api/entities", data);
  return response.data;
}

export async function updateSomeEntity(id: string, data: Partial<SomeEntityResponse>): Promise<SomeEntityResponse> {
  const response = await api.put<SomeEntityResponse>(`/api/entities/${id}`, data);
  return response.data;
}

export async function deleteSomeEntity(id: string): Promise<void> {
  await api.delete(`/api/entities/${id}`);
}
```

### Использование с TanStack Query

```typescript
// src/entities/some-entity/model/useSomeEntity.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSomeEntity, createSomeEntity, updateSomeEntity, deleteSomeEntity } from "../api/someEntityApi";

// Query для получения данных
export function useSomeEntity(id: string) {
  return useQuery({
    queryKey: ["some-entity", id],
    queryFn: () => fetchSomeEntity({ id }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Mutation для создания
export function useCreateSomeEntity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSomeEntity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["some-entity"] });
    },
  });
}

// Mutation для обновления
export function useUpdateSomeEntity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SomeEntityResponse> }) => 
      updateSomeEntity(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["some-entity", id] });
    },
  });
}

// Mutation для удаления
export function useDeleteSomeEntity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteSomeEntity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["some-entity"] });
    },
  });
}
```

## Работа с формами

### Создание формы с Material-UI

```typescript
// src/features/some-feature/ui/SomeForm.tsx
import { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

interface SomeFormData {
  name: string;
  email: string;
  description: string;
}

interface SomeFormProps {
  onSubmit: (data: SomeFormData) => void;
  initialData?: Partial<SomeFormData>;
}

export function SomeForm({ onSubmit, initialData }: SomeFormProps) {
  const [formData, setFormData] = useState<SomeFormData>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    description: initialData?.description || "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SomeFormData, string>>>({});

  const handleChange = (field: keyof SomeFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    // Очистка ошибки при изменении
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SomeFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Имя обязательно";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email обязателен";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Некорректный email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6">Форма</Typography>
      
      <TextField
        label="Имя"
        value={formData.name}
        onChange={handleChange("name")}
        error={!!errors.name}
        helperText={errors.name}
        fullWidth
        required
      />

      <TextField
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange("email")}
        error={!!errors.email}
        helperText={errors.email}
        fullWidth
        required
      />

      <TextField
        label="Описание"
        multiline
        rows={4}
        value={formData.description}
        onChange={handleChange("description")}
        fullWidth
      />

      <Button type="submit" variant="contained" fullWidth>
        Сохранить
      </Button>
    </Box>
  );
}
```

## Работа с таблицами (MUI DataGrid)

### Создание таблицы

```typescript
// src/features/some-feature/ui/SomeTable.tsx
import { useMemo } from "react";
import { Box, DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useSomeEntities } from "../model/useSomeEntities";

export function SomeTable() {
  const { data, isLoading, error } = useSomeEntities();
  
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "id",
        headerName: "ID",
        width: 100,
      },
      {
        field: "name",
        headerName: "Имя",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "email",
        headerName: "Email",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "status",
        headerName: "Статус",
        width: 120,
        renderCell: (params) => (
          <Box
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: params.value === "active" ? "success.light" : "error.light",
              color: "white",
              fontSize: 12,
            }}
          >
            {params.value}
          </Box>
        ),
      },
      {
        field: "createdAt",
        headerName: "Создан",
        width: 150,
        valueFormatter: (value) => new Date(value).toLocaleDateString(),
      },
    ],
    []
  );

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error.message}</div>;

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={data?.items || []}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={data?.totalCount || 0}
        paginationMode="server"
        loading={isLoading}
        pageSizeOptions={[10, 20, 50]}
        disableRowSelectionOnClick
      />
    </Box>
  );
}
```

## Работа с фильтрами

### Создание фильтров

```typescript
// src/features/some-feature/model/useSomeFilters.ts
import { useState, useCallback, useMemo } from "react";

export interface SomeFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useSomeFilters() {
  const [filters, setFilters] = useState<SomeFilters>({});

  const updateFilter = useCallback(<K extends keyof SomeFilters>(
    key: K,
    value: SomeFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => 
      value !== undefined && value !== ""
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
}
```

### Компонент фильтров

```typescript
// src/features/some-feature/ui/SomeFilters.tsx
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";
import { useSomeFilters } from "../model/useSomeFilters";

export function SomeFilters() {
  const { filters, updateFilter, clearFilters, hasActiveFilters } = useSomeFilters();

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
      <TextField
        label="Поиск"
        value={filters.search || ""}
        onChange={(e) => updateFilter("search", e.target.value)}
        size="small"
        sx={{ minWidth: 200 }}
      />

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Статус</InputLabel>
        <Select
          value={filters.status || ""}
          label="Статус"
          onChange={(e) => updateFilter("status", e.target.value)}
        >
          <MenuItem value="">Все</MenuItem>
          <MenuItem value="active">Активные</MenuItem>
          <MenuItem value="inactive">Неактивные</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Дата с"
        type="date"
        value={filters.dateFrom || ""}
        onChange={(e) => updateFilter("dateFrom", e.target.value)}
        size="small"
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 150 }}
      />

      <TextField
        label="Дата по"
        type="date"
        value={filters.dateTo || ""}
        onChange={(e) => updateFilter("dateTo", e.target.value)}
        size="small"
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 150 }}
      />

      {hasActiveFilters && (
        <Button variant="outlined" onClick={clearFilters}>
          Очистить
        </Button>
      )}
    </Box>
  );
}
```

## Оптимизация производительности

### Использование React.memo

```typescript
// src/features/some-feature/ui/SomeItem.tsx
import { memo } from "react";

interface SomeItemProps {
  item: SomeItem;
  onSelect: (id: string) => void;
}

export const SomeItem = memo<SomeItemProps>(({ item, onSelect }) => {
  return (
    <Box onClick={() => onSelect(item.id)}>
      {/* контент */}
    </Box>
  );
});
```

### Использование useMemo и useCallback

```typescript
// src/features/some-feature/ui/SomeList.tsx
import { useMemo, useCallback } from "react";

export function SomeList({ items }: { items: SomeItem[] }) {
  const filteredItems = useMemo(() => {
    return items.filter(item => item.active);
  }, [items]);

  const handleSelect = useCallback((id: string) => {
    // обработка выбора
  }, []);

  const sortedItems = useMemo(() => {
    return filteredItems.sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredItems]);

  return (
    <Box>
      {sortedItems.map(item => (
        <SomeItem key={item.id} item={item} onSelect={handleSelect} />
      ))}
    </Box>
  );
}
```

## Тестирование

### Unit-тесты

```typescript
// src/features/some-feature/model/useSomeFeature.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSomeFeature } from "./useSomeFeature";

// Мок API
jest.mock("../api/someFeatureApi", () => ({
  fetchSomeFeature: jest.fn(),
}));

describe("useSomeFeature", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  test("should fetch data successfully", async () => {
    const mockData = { id: "1", name: "Test" };
    (fetchSomeFeature as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useSomeFeature({ id: "1" }), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    expect(fetchSomeFeature).toHaveBeenCalledWith({ id: "1" });
  });
});
```

### Компонентные тесты

```typescript
// src/features/some-feature/ui/SomeComponent.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SomeComponent } from "./SomeComponent";

// Моки
jest.mock("../model/useSomeFeature", () => ({
  useSomeFeature: jest.fn(),
}));

describe("SomeComponent", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  test("should render loading state", () => {
    (useSomeFeature as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithQueryClient(<SomeComponent />);
    
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("should render data successfully", async () => {
    const mockData = { id: "1", name: "Test Item" };
    (useSomeFeature as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    });

    renderWithQueryClient(<SomeComponent />);
    
    await waitFor(() => {
      expect(screen.getByText("Test Item")).toBeInTheDocument();
    });
  });
});
```

## Линтинг и форматирование

### ESLint конфигурация

Проект использует ESLint с конфигурацией:

```javascript
// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tsparser,
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
];
```

### Правила кодирования

1. **Используйте TypeScript** - все файлы должны иметь строгую типизацию
2. **Следуйте FSD архитектуре** - четкое разделение по слоям
3. **Используйте именованные экспорты** - для лучшей tree-shaking оптимизации
4. **Пишите тесты** - для критической бизнес-логики
5. **Оптимизируйте ререндеры** - используйте memo, useMemo, useCallback

## Деплой

### Сборка проекта

```bash
# Продакшен сборка
npm run build

# Предпросмотр сборки
npm run preview
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### CI/CD

Проект использует GitLab CI для автоматического деплоя. Конфигурация в `.gitlab-ci.yml`.

## Полезные ресурсы

- [Feature-Sliced Design](https://feature-sliced.design/) - методология архитектуры
- [TanStack Query](https://tanstack.com/query/latest) - управление серверным состоянием
- [Material-UI](https://mui.com/) - UI-кит
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/) - TypeScript с React

## Частые проблемы и решения

### Проблема: Перерисовки компонентов

**Решение**: Используйте `React.memo`, `useMemo`, `useCallback`

```typescript
const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    return expensiveProcessing(data);
  }, [data]);

  return <div>{/* рендер */}</div>;
});
```

### Проблема: Устаревшие данные в кэше

**Решение**: Инвалидируйте кэш при мутациях

```typescript
const mutation = useMutation({
  mutationFn: updateData,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["data"] });
  },
});
```

### Проблема: Сложная типизация API

**Решение**: Создавайте типы для всех API-ответов

```typescript
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
```

---

**Автор**: Максим Местоев  
**Версия**: 1.0  
**Обновлено**: 2026-06-26