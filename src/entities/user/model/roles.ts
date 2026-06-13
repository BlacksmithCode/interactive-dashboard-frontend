export const ROLES = {
  ADMIN: "ROLE_ADMIN",
  HRD_EVALUATION: "ROLE_HRD_EVALUATION",
  HRD_DOMAIN: "ROLE_HRD_DOMAIN",
  MANAGER: "ROLE_MANAGER",
} as const;

export const BACKEND_ROLES = {
  ADMIN: "ADMIN",
  HRD_EVALUATION: "HRD_EVALUATION",
  HRD_DOMAIN: "HRD_DOMAIN",
  MANAGER: "MANAGER",
} as const;

export const ROLE_NAMES: Record<string, string> = {
  [BACKEND_ROLES.ADMIN]: "Администратор",
  [BACKEND_ROLES.HRD_EVALUATION]: "HRD Оценка",
  [BACKEND_ROLES.HRD_DOMAIN]: "HRD Домен",
  [BACKEND_ROLES.MANAGER]: "Руководитель",
};