# 004. Аутентификация через JWT и React Context

## Статус
Accepted

## Контекст
Для проекта Interactive Dashboard Frontend требовалась система аутентификации, которая обеспечивала:

- Безопасную авторизацию пользователей
- Ролевой доступ к разным частям системы
- Сохранение сессии между перезагрузками
- Автоматическое обновление токенов
- Защиту маршрутов и компонентов

Система должна была интегрироваться с существующим backend API и поддерживать 4 роли пользователей: ADMIN, HRD_EVALUATION, HRD_DOMAIN, MANAGER.

## Решение
Было решено использовать JWT (JSON Web Tokens) для аутентификации в сочетании с React Context для управления состоянием авторизации.

### Архитектура решения

1. **JWT токены** - для безопасной передачи данных между клиентом и сервером
2. **React Context** - для глобального управления состоянием авторизации
3. **localStorage** - для сохранения токена между сессиями
4. **Axios interceptors** - для автоматического добавления токена в запросы
5. **Protected routes** - для защиты маршрутов на клиенте

## Последствия

### Преимущества

1. **Безопасность** - JWT обеспечивает криптографическую защиту данных
2. **Stateless** - сервер не хранит состояние сессии
3. **Масштабируемость** - легко добавлять новые роли и права
4. **UX** - сохранение сессии между перезагрузками
5. **Интеграция** - хорошая интеграция с React экосистемой
6. **Автоматизация** - автоматическое добавление токена в запросы

### Недостатки

1. **Размер токена** - JWT токены больше обычных session tokens
2. **Отзыв токена** - сложность мгновенного отзыва токена
3. **Storage security** - localStorage уязвим к XSS атакам
4. **Refresh complexity** - сложность обновления токенов

### Влияние на систему

- Все защищенные маршруты требуют авторизации
- API-клиент автоматически добавляет токен в заголовки
- Компоненты могут проверять права доступа через RoleGuard
- 401 ошибки автоматически обрабатываются с перенаправлением

## Альтернативы

### Альтернатива 1: Session-based authentication
- **Описание**: Традиционные сессии с cookies
- **Почему не выбрана**: Требует server-side state, хуже для microservices

### Альтернатива 2: OAuth 2.0
- **Описание**: Делегированная авторизация через внешние провайдеры
- **Почему не выбрана**: Избыточная сложность для корпоративного приложения

### Альтернатива 3: Redux для auth state
- **Описание**: Использование Redux для управления состоянием авторизации
- **Почему не выбрана**: Избыточная сложность, Context достаточно

### Альтернатива 4: Cookies вместо localStorage
- **Описание**: Хранение токена в httpOnly cookies
- **Почему не выбрана**: Сложнее интеграция с React, требует server-side настройки

## Реализация

### Управление токенами

```typescript
// src/entities/user/model/token.ts
const TOKEN_KEY = "auth_token";

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeader(): string | null {
  const token = getAuthToken();
  return token ? `Bearer ${token}` : null;
}

export function isLoggedIn(): boolean {
  return !!getAuthToken();
}
```

### Auth Context

```typescript
// src/entities/user/model/AuthContext.ts
export interface AuthContextProps {
  user: User | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// src/entities/user/model/AuthProvider.tsx
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback((data: AuthResponse) => {
    setUser({
      id: data.id,
      username: data.username,
      fullName: data.fullName,
      role: data.role,
      domain: data.domain,
      active: data.active,
    });
    setToken(data.token);
    setAuthToken(data.token);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setToken(null);
      removeAuthToken();
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          // Валидация токена
          const userData = await validateToken(token);
          setUser(userData);
          setToken(token);
        } catch {
          removeAuthToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const value: AuthContextProps = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Роли и права доступа

```typescript
// src/entities/user/model/roles.ts
export const ROLES = {
  ADMIN: "ROLE_ADMIN",
  HRD_EVALUATION: "ROLE_HRD_EVALUATION",
  HRD_DOMAIN: "ROLE_HRD_DOMAIN",
  MANAGER: "ROLE_MANAGER",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    "users.read",
    "users.write",
    "dashboard.read",
    "dashboard.write",
    "admin.read",
    "admin.write",
  ],
  [ROLES.HRD_EVALUATION]: [
    "dashboard.read",
    "dashboard.write",
    "leaders.read",
    "leaders.write",
  ],
  [ROLES.HRD_DOMAIN]: [
    "dashboard.read",
    "leaders.read",
  ],
  [ROLES.MANAGER]: [
    "dashboard.read",
    "team.read",
  ],
} as const;
```

### Защита компонентов

```typescript
// src/entities/user/ui/RoleGuard.tsx
interface RoleGuardProps {
  allowedRoles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Использование
<RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.HRD_EVALUATION]}>
  <AdminPanel />
</RoleGuard>
```

### Защита маршрутов

```typescript
// src/shared/ui/ProtectedRoute.tsx
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// В роутинге
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Интеграция с API клиентом

```typescript
// src/shared/api/apiClient.ts
api.interceptors.request.use((config) => {
  const authHeader = getAuthHeader();
  if (authHeader) {
    config.headers.Authorization = authHeader;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      removeAuthToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

## Безопасность

### Защита от XSS

```typescript
// Валидация и санитизация данных
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, """)
    .replace(/'/g, "&#x27;");
}
```

### Время жизни токена

```typescript
// Конфигурация токена
export const TOKEN_CONFIG = {
  ACCESS_TOKEN_LIFETIME: 24 * 60 * 60 * 1000, // 24 часа
  REFRESH_TOKEN_LIFETIME: 7 * 24 * 60 * 60 * 1000, // 7 дней
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 минут до истечения
};
```

## Лучшие практики

1. **Всегда валидируйте токен** - на клиенте и сервере
2. **Используйте https** - для защиты токена в transit
3. **Ограничьте права** - принцип минимальных привилегий
4. **Логируйте попытки доступа** - для аудита безопасности
5. **Обновляйте токены** - до истечения срока действия

---

**Автор**: Максим Местоев  
**Дата**: 2026-06-26  
**Обновлено**: 2026-06-26