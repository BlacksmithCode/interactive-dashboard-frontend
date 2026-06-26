# Руководство программиста: Interactive Dashboard Frontend

## Обзор проекта

**Interactive Dashboard Frontend** — это современное веб-приложение для визуализации HR-метрик и управления преемственностью в организации. Проект построен на React 18+ с TypeScript, использует Material-UI v5/v6 для компонентов и следует лучшим практикам фронтенд-разработки.

### Назначение

- Визуализация данных о руководителях и их преемниках
- Анализ критичности должностей и готовности кадрового резерва
- Экспорт отчетов в Excel и PDF форматы
- Ролевой доступ для разных категорий пользователей

## Стек технологий

| Слой | Технология | Назначение |
|------|-----------|-----------|
| Язык | TypeScript | Строгая типизация, защита от опечаток |
| UI | React 18+ | Фундамент интерфейса |
| Сборщик | Vite | Быстрый запуск и HMR |
| UI-кит | MUI v5/v6 | Готовые компоненты: таблицы, карточки, фильтры |
| Таблицы | MUI DataGrid | Сортировка, пагинация, фильтрация |
| Роутинг | React Router v6 | Страницы: логин, дашборды |
| API | Axios + TanStack Query | HTTP-клиент, кэширование, управление состоянием |
| Авторизация | React Context + localStorage | Токен, роли, защита маршрутов |
| Экспорт | xlsx, jspdf + jspdf-autotable | Скачивание отчётов в Excel/PDF |
| Даты | date-fns / Intl | Форматирование дат и чисел |

## Архитектура

### Feature-Sliced Design (FSD)

Проект следует методологии Feature-Sliced Design с разделением на слои:

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

1. **Разделение ответственности**: Каждый слой имеет чёткую зону ответственности
2. **Инверсия зависимостей**: API-клиент не зависит от UI-слоя
3. **Управление состоянием**: TanStack Query для серверного состояния, React Context для клиентского
4. **Типизация**: Строгая TypeScript-типизация на всех уровнях

## Структура проекта

### Entities слой

Бизнес-сущности и их API:

- **`entities/dashboard`** - сущности дашборда (статистика, 9-box матрица)
- **`entities/leader`** - сущности руководителей и преемников
- **`entities/user`** - сущности пользователей и авторизации

### Features слой

Бизнес-фичи с полной инкапсуляцией:

- **`features/dashboard`** - дашборд со статистикой и фильтрами
- **`features/leaders-successors`** - управление руководителями и преемниками
- **`features/admin`** - административная панель
- **`features/summary-stats`** - сводная статистика

### Shared слой

Переиспользуемый код:

- **`shared/api`** - HTTP-клиент и утилиты
- **`shared/theme`** - тема и стилизация
- **`shared/ui`** - базовые UI-компоненты
- **`shared/lib`** - утилиты и хелперы

## Система авторизации и ролей

### Роли пользователей

```typescript
export const ROLES = {
  ADMIN: "ROLE_ADMIN",           // Администратор системы
  HRD_EVALUATION: "ROLE_HRD_EVALUATION", // HRD по оценке
  HRD_DOMAIN: "ROLE_HRD_DOMAIN",   // HRD по доменам
  MANAGER: "ROLE_MANAGER",         // Руководитель
} as const;
```

### Защита маршрутов

- **`ProtectedRoute`** - базовая защита для авторизованных пользователей
- **`RoleGuard`** - компонент для ролевого доступа к UI-элементам

### Управление токенами

- Хранение в localStorage
- Автоматическое добавление в заголовки запросов
- Обработка 401 ошибок с перенаправлением на страницу входа

## Работа с API

### HTTP-клиент

Централизованный HTTP-клиент на основе Axios с:

- Автоматической обработкой ошибок
- Добавлением токена авторизации
- Нормализацией ответов

```typescript
import { api } from "@/shared/api/apiClient";

// Пример использования
const response = await api.get<StatsResponse>("/api/dashboard/stats");
```

### TanStack Query

Управление серверным состоянием с:

- Кэшированием ответов (5 минут по умолчанию)
- Повторными запросами при ошибках
- Оптимистичными обновлениями

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["stats", filters],
  queryFn: () => fetchStats(filters),
  staleTime: 5 * 60 * 1000,
});
```

## UI-компоненты и стилизация

### Тема приложения

Централизованная тема в стиле Т1 с:

- Светлой и тёмной вариантами
- Брендовыми цветами и градиентами
- Переходами и анимациями

```typescript
import { colors } from "@/shared/theme/tokens";

// Использование в компонентах
<Box sx={{ bgcolor: colors.primary, color: colors.white }}>
  {/* Содержимое */}
</Box>
```

### Переиспользуемые компоненты

- **`PanelSwitcher`** - переключатель панелей
- **`RoleGuard`** - защита по ролям
- **`ErrorBoundary`** - обработка ошибок рендеринга
- **`Logo`** - компонент логотипа

## Бизнес-логика

### 9-box матрица

Матрица оценки потенциала и результативности руководителей:

```typescript
export type NineBoxKey =
  | "AA" | "AB" | "AC" | "AD" | "AE"
  | "BA" | "BB" | "BC" | "BD" | "BE"
  | "CA" | "CB" | "CC" | "CD" | "CE";
```

### Фильтры дашборда

Централизованное управление фильтрами через Context:

```typescript
interface DashboardFilters {
  gradeMin?: number;
  domain?: string;
  critical?: boolean;
  hasSuccessor?: boolean;
  searchName?: string;
  positionFilter?: string;
}
```

## Экспорт данных

### Excel экспорт

```typescript
import { downloadExcelExport } from "@/features/dashboard/api/export";
import { downloadFile } from "@/shared/lib/download";

const blob = await downloadExcelExport(filters);
downloadFile(blob, "export.xlsx");
```

### PDF экспорт

```typescript
import { downloadPdfExport } from "@/features/dashboard/api/export";

const blob = await downloadPdfExport(filters);
downloadFile(blob, "dashboard_report.pdf");
```

## Разработка и отладка

### Запуск проекта

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Сборка проекта
npm run build

# Линтинг
npm run lint
```

### Переменные окружения

```bash
# .env
VITE_API_BASE_URL=http://localhost:8080
```

### Структура конфигурации

- **`vite.config.ts`** - конфигурация Vite
- **`tsconfig.json`** - конфигурация TypeScript
- **`eslint.config.js`** - конфигурация ESLint

## Рекомендации по разработке

### Добавление новых фичей

1. Создать папку в `features/`
2. Реализовать слои: `api/`, `model/`, `ui/`, `hooks/`
3. Добавить экспорт в `index.ts`
4. Подключить в роутинг

### Работа с типами

- Использовать строгую типизацию
- Избегать `any` типа
- Создавать интерфейсы для API-ответов

### Оптимизация производительности

- Использовать `React.memo` для компонентов
- Применять `useMemo` и `useCallback` для вычислений
- Оптимизировать ререндеры в таблицах

## Тестирование

### Стратегия тестирования

- Unit-тесты для утилит и хуков
- Интеграционные тесты для API
- E2E-тесты для ключевых сценариев

### Пример теста

```typescript
import { renderHook } from '@testing-library/react';
import { useStatsQuery } from '@/features/dashboard/hooks/useStatsQuery';

test('should fetch stats successfully', async () => {
  const { result } = renderHook(() => useStatsQuery({}));
  
  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```


## Безопасность и Аутентификация

- JWT-токены
- Время жизни токена: 24 часа
- Автоматическое обновление

### Авторизация

- Ролевой доступ к ресурсам
- Проверка прав на клиенте и сервере
- Защита от CSRF

## Заключение

Этот проект следует современным практикам фронтенд-разработки с чётким разделением ответственности, сильной типизацией и удобной архитектурой. Руководство будет обновляться по мере развития проекта.

---

**Автор**: Максим Местоев  
**Версия**: 1.0  
**Обновлено**: 2026-06-26