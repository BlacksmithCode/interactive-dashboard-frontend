# Полное руководство программиста

## Оглавление

Это руководство объединяет всю документацию по проекту Interactive Dashboard Frontend и предназначено для программистов, которые будут работать с проектом.

### Разделы документации

1. [Обзор проекта](#обзор-проекта)
2. [Архитектура](#архитектура)
3. [Быстрый старт](#быстрый-старт)
4. [Разработка](#разработка)
5. [API](#api)
6. [Тестирование](#тестирование)
7. [Деплой](#деплой)
8. [Архитектурные решения](#архитектурные-решения)

---

## Обзор проекта

**Interactive Dashboard Frontend** — это современное веб-приложение для визуализации HR-метрик и управления преемственностью в организации.

### Ключевые возможности

- 📊 Визуализация данных о руководителях и их преемниках
- 🎯 Анализ критичности должностей и готовности кадрового резерва
- 📄 Экспорт отчетов в Excel и PDF форматы
- 🔐 Ролевой доступ для разных категорий пользователей
- 📱 Адаптивный дизайн для всех устройств

### Технологический стек

| Слой | Технология | Версия |
|------|-----------|--------|
| Язык | TypeScript | 5.0+ |
| UI | React | 19.2.5 |
| Сборщик | Vite | 6.0+ |
| UI-кит | MUI | 9.0.1 |
| Таблицы | MUI DataGrid | 7.0+ |
| Роутинг | React Router | 6.0+ |
| API | Axios + TanStack Query | 1.7+ / 5.100+ |
| Авторизация | JWT + React Context | - |
| Экспорт | xlsx, jspdf | - |

---

## Архитектура

### Feature-Sliced Design (FSD)

Проект следует методологии Feature-Sliced Design:

```
src/
├── app/           # App слой (инициализация, роутинг)
├── pages/         # Pages слой (страницы приложения)
├── widgets/       # Widgets слой (композиции UI)
├── features/      # Features слой (бизнес-фичи)
├── entities/      # Entities слой (бизнес-сущности)
└── shared/        # Shared слой (переиспользуемый код)
```

### Ключевые архитектурные решения

Подробное описание архитектурных решений см. в [ADR документации](./adr/):

- [001. Feature-Sliced Design](./adr/001-architecture-fsd.md)
- [002. TanStack Query](./adr/002-state-management-tanstack-query.md)
- [003. Material-UI](./adr/003-ui-framework-material-ui.md)
- [004. JWT + Context](./adr/004-authentication-jwt-context.md)

---

## Быстрый старт

### Требования

- Node.js 18+
- npm 9+
- Git

### Установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd interactive-dashboard-frontend

# Установка зависимостей
npm install

# Создание .env файла
cp .env.example .env
```

### Запуск

```bash
# Dev сервер
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр сборки
npm run preview

# Линтинг
npm run lint

# Проверка типов
npm run type-check
```

### Переменные окружения

```bash
# .env
VITE_API_BASE_URL=http://localhost:8080
```

---

## Разработка

### Создание новой фичи

1. **Создайте структуру папок**:

```bash
src/features/new-feature/
├── api/           # API вызовы
├── model/         # Состояние и бизнес-логика
├── ui/            # UI компоненты
├── hooks/         # React хуки
├── config/        # Конфигурация
└── index.ts       # Публичные экспорты
```

2. **Реализуйте API слой**:

```typescript
// src/features/new-feature/api/newFeatureApi.ts
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

3. **Создайте хук для состояния**:

```typescript
// src/features/new-feature/model/useNewFeature.ts
export function useNewFeature(params: NewFeatureRequest) {
  return useQuery({
    queryKey: ["new-feature", params],
    queryFn: () => fetchNewFeature(params),
    staleTime: 5 * 60 * 1000,
  });
}
```

4. **Создайте UI компонент**:

```typescript
// src/features/new-feature/ui/NewFeatureComponent.tsx
export function NewFeatureComponent() {
  const { data, isLoading, error } = useNewFeature(/* params */);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{/* рендер данных */}</div>;
}
```

5. **Добавьте экспорты**:

```typescript
// src/features/new-feature/index.ts
export * from "./api/newFeatureApi";
export * from "./model/useNewFeature";
export * from "./ui/NewFeatureComponent";
```

### Работа с формами

```typescript
import { useState } from "react";
import { Box, TextField, Button } from "@mui/material";

export function SomeForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        label="Имя"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        fullWidth
      />
      <Button type="submit" variant="contained">
        Сохранить
      </Button>
    </Box>
  );
}
```

### Работа с таблицами

```typescript
import { DataGrid, GridColDef } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 100 },
  { field: "name", headerName: "Имя", flex: 1 },
  { field: "email", headerName: "Email", flex: 1 },
];

export function SomeTable({ data }: { data: Item[] }) {
  return (
    <DataGrid
      rows={data}
      columns={columns}
      pageSize={20}
      rowsPerPageOptions={[10, 20, 50]}
    />
  );
}
```

### Оптимизация производительности

```typescript
// Используйте React.memo для компонентов
const ExpensiveComponent = memo(({ data }: { data: Data }) => {
  const processedData = useMemo(() => {
    return expensiveProcessing(data);
  }, [data]);

  return <div>{/* рендер */}</div>;
});

// Используйте useCallback для функций
const handleClick = useCallback((id: string) => {
  // обработчик
}, []);
```

---

## API

### HTTP клиент

Проект использует централизованный HTTP клиент на основе Axios:

```typescript
import { api } from "@/shared/api/apiClient";

// GET запрос
const response = await api.get<ResponseType>("/api/endpoint");

// POST запрос
const result = await api.post<ResponseType>("/api/endpoint", data);
```

### Авторизация

```typescript
// Установка токена
import { setAuthToken } from "@/entities/user/model/token";
setAuthToken("jwt_token_here");

// Токен автоматически добавляется во все запросы
```

### Обработка ошибок

```typescript
try {
  const response = await api.get("/api/data");
} catch (error) {
  const normalizedError = error as NormalizedError;
  console.error(normalizedError.message);
}
```

### Подробная документация API

См. полную [документацию API](./api.md).

---

## Тестирование

### Структура тестов

```
src/
├── __tests__/           # Общие тесты
├── features/
│   └── some-feature/
│       └── __tests__/   # Тесты фичи
└── shared/
    └── __tests__/       # Тесты утилит
```

### Unit тесты

```typescript
// src/features/some-feature/__tests__/useSomeFeature.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useSomeFeature } from "../model/useSomeFeature";

test("should fetch data successfully", async () => {
  const { result } = renderHook(() => useSomeFeature({ id: "1" }));

  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

### Компонентные тесты

```typescript
// src/features/some-feature/__tests__/SomeComponent.test.tsx
import { render, screen } from "@testing-library/react";
import { SomeComponent } from "../ui/SomeComponent";

test("should render component", () => {
  render(<SomeComponent />);
  expect(screen.getByText("Заголовок")).toBeInTheDocument();
});
```

### Запуск тестов

```bash
# Запуск всех тестов
npm test

# Запуск с покрытием
npm run test:coverage

# Запуск в watch режиме
npm run test:watch
```

---

## Деплой

### Docker

```dockerfile
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

### Сборка

```bash
# Продакшен сборка
npm run build

# Проверка сборки
npm run preview
```

---

## Архитектурные решения

### Список ADR

| Номер | Название | Статус |
|-------|----------|--------|
| [001](./adr/001-architecture-fsd.md) | Feature-Sliced Design | Accepted |
| [002](./adr/002-state-management-tanstack-query.md) | TanStack Query | Accepted |
| [003](./adr/003-ui-framework-material-ui.md) | Material-UI | Accepted |
| [004](./adr/004-authentication-jwt-context.md) | JWT + Context | Accepted |

### Процесс добавления ADR

1. Создайте новый файл в `docs/adr/` с именем `XXX-decision-title.md`
2. Следуйте шаблону ADR
3. Добавьте запись в оглавление
4. Обсудите с командой
5. Обновите статус на "Accepted"

---

## Полезные ресурсы

### Документация

- [Material-UI](https://mui.com/) - UI компоненты
- [TanStack Query](https://tanstack.com/query/latest) - Управление состоянием
- [React Router](https://reactrouter.com/) - Роутинг
- [Feature-Sliced Design](https://feature-sliced.design/) - Архитектура

### Инструменты

- [VS Code](https://code.visualstudio.com/) - Рекомендуемая IDE
- [React DevTools](https://react.dev/learn/react-developer-tools) - Отладка React
- [TanStack Query DevTools](https://tanstack.com/query/latest/docs/devtools) - Отладка запросов

### Лучшие практики

1. **Следуйте FSD архитектуре** - четкое разделение ответственности
2. **Используйте TypeScript** - строгая типизация
3. **Пишите тесты** - для критической логики
4. **Оптимизируйте производительность** - memo, useMemo, useCallback
5. **Следуйте кодинг стандартам** - ESLint, Prettier

---

## Частые проблемы

### Проблема: Перерисовки компонентов

**Решение**: Используйте `React.memo`, `useMemo`, `useCallback`

```typescript
const Component = memo(({ data }) => {
  const processed = useMemo(() => process(data), [data]);
  return <div>{processed}</div>;
});
```

### Проблема: Устаревшие данные

**Решение**: Инвалидируйте кэш при мутациях

```typescript
const mutation = useMutation({
  mutationFn: updateData,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["data"] });
  },
});
```

### Проблема: Ошибки TypeScript

**Решение**: Используйте строгую типизацию

```typescript
// Правильно
interface ApiResponse<T> {
  data: T;
  success: boolean;
}

// Неправильно
const response: any = await api.get("/api/data");
```

---

## Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте [документацию API](./api.md)
2. Посмотрите [руководство по разработке](./development-guide.md)
3. Изучите [архитектурные решения](./adr/)
4. Обратитесь к команде разработки

---

**Автор**: Максим Местоев  
**Версия**: 1.0  
**Обновлено**: 2026-06-26  
**Лицензия**: MIT