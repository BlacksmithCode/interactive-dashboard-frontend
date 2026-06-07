import type { ReactNode } from "react";
import { useAuth } from "../../app/providers/useAuth";

interface RoleGuardProps {
  /** Массив ролей, которым разрешено видеть этот контент */
  allowedRoles: string[];
  children: ReactNode;
}

/**
 * Компонент-обертка для скрытия UI элементов в зависимости от роли.
 */
export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { role } = useAuth();
  
  if (!role || !allowedRoles.includes(role)) {
    return null; // Скрываем контент, если роль не подходит
  }

  return <>{children}</>;
}