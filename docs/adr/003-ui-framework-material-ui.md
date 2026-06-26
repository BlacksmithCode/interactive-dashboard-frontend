# 003. Выбор UI-фреймворка Material-UI

## Статус
Accepted

## Контекст
Для проекта Interactive Dashboard Frontend требовался UI-фреймворк, который обеспечивал:

- Профессиональный внешний вид для корпоративного приложения
- Богатый набор компонентов для таблиц, форм, фильтров
- Поддержку темизации для брендинга Т1
- TypeScript поддержку
- Хорошую документацию и сообщество
- Производительность для больших объемов данных

Проект требовал сложных UI-элементов: таблицы с сортировкой/фильтрацией, формы валидации, диаграммы, адаптивный дизайн.

## Решение
Было решено использовать Material-UI (MUI) v5/v6 как основной UI-фреймворк.

Material-UI предоставляет:

- **Полный набор компонентов** - таблицы, формы, навигация, обратная связь
- **Система темизации** - гибкая настройка цветов, типографики, spacing
- **TypeScript поддержку** - полная типизация всех компонентов
- **Производительность** - оптимизированные компоненты для больших данных
- **Доступность** - соответствие WCAG стандартам
- **Экосистему** - дополнительные пакеты (date-pickers, data-grid)

## Последствия

### Преимущества

1. **Скорость разработки** - готовые компоненты ускоряют разработку
2. **Консистентный дизайн** - единый стиль across приложения
3. **Брендинг** - легкая адаптация под Т1 бренд
4. **Поддержка** - активное сообщество и регулярные обновления
5. **Доступность** - встроенная поддержка accessibility
6. **Интеграция** - хорошая интеграция с React экосистемой

### Недостатки

1. **Размер бандла** - увеличивает размер приложения
2. **Кривая обучения** - требуется изучение MUI концепций
3. **Кастомизация** - сложная кастомизация некоторых компонентов
4. **Зависимости** - много peer dependencies

### Влияние на систему

- Все UI-компоненты используют MUI
- Система темизации централизована
- Стили реализованы через sx prop и theme
- Таблицы используют MUI DataGrid
- Формы используют MUI компоненты

## Альтернативы

### Альтернатива 1: Ant Design
- **Описание**: Популярный UI-фреймворк с enterprise фокусом
- **Почему не выбрана**: Меньшая гибкость темизации, другой дизайн-систем

### Альтернатива 2: Chakra UI
- **Описание**: Современный UI-фреймворк с фокусом на accessibility
- **Почему не выбрана**: Меньше enterprise-компонентов, меньше компонентов для таблиц

### Альтернатива 3: Headless UI + Tailwind
- **Описание**: Utility-first CSS с нестилизованными компонентами
- **Почему не выбрана**: Требует больше времени на стилизацию, меньше готовых компонентов

### Альтернатива 4: Bootstrap + React-Bootstrap
- **Описание**: Классический фреймворк с React адаптером
- **Почему не выбрана**: Устаревший дизайн, меньше TypeScript поддержки

## Реализация

### Настройка темы

```typescript
// src/shared/theme/tokens.ts
import { createTheme } from "@mui/material/styles";

export const colors = {
  primary: "#0066CC",
  secondary: "#FF6B35",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  white: "#FFFFFF",
  black: "#000000",
};

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: colors.primary,
    },
    secondary: {
      main: colors.secondary,
    },
    // ... другие цвета
  },
  typography: {
    fontFamily: '"ALS Hauss", sans-serif',
    // ... настройки типографики
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    // ... кастомизация компонентов
  },
});
```

### Использование компонентов

```typescript
// src/features/dashboard/ui/SomeComponent.tsx
import { Box, Card, CardContent, Typography, Button } from "@mui/material";

export function SomeComponent() {
  return (
    <Box sx={{ p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Заголовок
          </Typography>
          <Button variant="contained" color="primary">
            Действие
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
```

### Таблицы с DataGrid

```typescript
// src/features/leaders-successors/ui/LeadersTable.tsx
import { DataGrid, GridColDef } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  { field: "fullName", headerName: "ФИО", flex: 1 },
  { field: "position", headerName: "Должность", flex: 1 },
  { field: "grade", headerName: "Грейд", width: 100 },
];

export function LeadersTable({ data }: { data: Leader[] }) {
  return (
    <DataGrid
      rows={data}
      columns={columns}
      pageSize={20}
      rowsPerPageOptions={[10, 20, 50]}
      disableRowSelectionOnClick
    />
  );
}
```

## Стратегия темизации

### Светлая/темная тема

```typescript
// src/shared/theme/ColorModeProvider.tsx
import { createContext, useContext, useState } from "react";

export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const colorMode = {
    toggleColorMode: () => {
      setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
    },
  };

  const theme = useMemo(
    () => createTheme(getThemeOptions(mode)),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
```

### Брендовые цвета

```typescript
// src/shared/theme/tokens.ts
export const t1Colors = {
  primary: "#0066CC",     // Основной синий
  secondary: "#FF6B35",   // Оранжевый
  accent: "#00A86B",      // Зеленый
  neutral: {
    50: "#F8F9FA",
    100: "#E9ECEF",
    // ... градации серого
  },
};
```

## Оптимизация производительности

### Tree-shaking

```typescript
// Импорт только нужных компонентов
import { Button } from "@mui/material/Button";
// Вместо
import { Button } from "@mui/material";
```

### Ленивая загрузка

```typescript
// src/features/dashboard/ui/HeavyComponent.tsx
import { lazy } from "react";

const HeavyComponent = lazy(() => import("./HeavyComponent"));

// Использование с Suspense
<Suspense fallback={<CircularProgress />}>
  <HeavyComponent />
</Suspense>
```

## Лучшие практики

1. **Используйте sx prop** - для быстрой стилизации
2. **Создавайте переиспользуемые компоненты** - на основе MUI
3. **Оптимизируйте импорты** - для уменьшения бандла
4. **Используйте theme tokens** - для консистентности
5. **Тестируйте accessibility** - для всех компонентов

---

**Автор**: Максим Местоев  
**Дата**: 2026-06-26  
**Обновлено**: 2026-06-26