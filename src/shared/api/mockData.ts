// --- Types (Matching Backend Entities) ---

export type Role = 'ROLE_ADMIN' | 'ROLE_MANAGER' | 'ROLE_HRD_DOMAIN' | 'ROLE_HRD_EVALUATION';

export interface User {
  id: number;
  username: string;
  password: string;
  fullName: string;
  domain: string | null;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface Employee {
  id: number;
  fullName: string;
  domain: string;
  position: string;
  grade: number;
  critical: boolean;
  assessment360: string;
  era: string;
  developmentProgram: string;
  potential: string;
  performance: string;
  careerStatus: string;
  managerId?: number;
}

export interface Successor {
  id: number;
  managerId: number;
  employeeId: number;
  successorStatus: string;
  readiness: string;
  isApproved: boolean;
  approvalDate: string | null;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  fullName: string;
}

export interface PageResponse<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
}

export interface DomainGistDto {
  domain: string;
  managersWithSuccessors: number;
  managersWithoutSuccessors: number;
}

export interface DashboardStats {
  managersWithSuccessors: number;
  managersWithoutSuccessors: number;
  criticalRoles: number;
  criticalRolesWithSuccessors: number;
  criticalRolesWithoutSuccessors: number;
  nonCriticalRoles: number;
  nonCriticalRolesWithSuccessors: number;
  nonCriticalRolesWithoutSuccessors: number;
}

export interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  domain: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export interface RegisterRequest {
  username: string;
  password?: string;
  fullName: string;
  domain: string;
  role: string;
}

// --- Mock Data Sources ---

// 1. Users (Login credentials)
export const MOCK_USERS: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'password', // Login: admin, Pass: password
    fullName: 'Системный Администратор',
    domain: null,
    role: 'ROLE_ADMIN',
    active: true,
    createdAt: '2023-01-01T00:00:00',
  },
  {
    id: 2,
    username: 'ivanov',
    password: 'password', // Login: ivanov, Pass: password
    fullName: 'Иванов Иван Иванович',
    domain: 'IT',
    role: 'ROLE_MANAGER',
    active: true,
    createdAt: '2023-02-15T10:00:00',
  },
  {
    id: 3,
    username: 'petrova',
    password: 'password',
    fullName: 'Петрова Анна Сергеевна',
    domain: 'HR',
    role: 'ROLE_HRD_EVALUATION',
    active: true,
    createdAt: '2023-03-10T10:00:00',
  },
];

// 2. Employees (Managers list)
export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 101,
    fullName: 'Иванов Иван Иванович',
    domain: 'IT',
    position: 'Руководитель отдела разработки',
    grade: 7,
    critical: true,
    assessment360: 'Выше ожидаемого',
    era: 'Mentor',
    developmentProgram: 'Executive Leadership',
    potential: 'High',
    performance: 'High',
    careerStatus: 'Ready for promotion',
  },
  {
    id: 102,
    fullName: 'Смирнова Елена Павловна',
    domain: 'HR',
    position: 'HR Директор',
    grade: 8,
    critical: true,
    assessment360: 'Выше ожидаемого',
    era: 'Leader',
    developmentProgram: 'Strategic HR',
    potential: 'High',
    performance: 'High',
    careerStatus: 'High Potential',
  },
  {
    id: 103,
    fullName: 'Козлов Дмитрий Алексеевич',
    domain: 'IT',
    position: 'Ведущий архитектор',
    grade: 6,
    critical: false,
    assessment360: 'Соответствует',
    era: 'Player',
    developmentProgram: 'Architecture Track',
    potential: 'Medium',
    performance: 'High',
    careerStatus: 'Stable',
  },
  {
    id: 104,
    fullName: 'Волкова Мария Игоревна',
    domain: 'Finance',
    position: 'Финансовый директор',
    grade: 7,
    critical: true,
    assessment360: 'Выше ожидаемого',
    era: 'Leader',
    developmentProgram: 'CFO Track',
    potential: 'High',
    performance: 'Medium',
    careerStatus: 'Development needed',
  },
  {
    id: 105,
    fullName: 'Соколов Андрей Викторович',
    domain: 'Sales',
    position: 'Коммерческий директор',
    grade: 7,
    critical: true,
    assessment360: 'Соответствует',
    era: 'Leader',
    developmentProgram: 'Sales Strategy',
    potential: 'Medium',
    performance: 'High',
    careerStatus: 'Key Holder',
  },
];

// 3. Successors (Linked to Managers by managerId)
export const MOCK_SUCCESSORS: Successor[] = [
  {
    id: 201,
    managerId: 101, // Иванов
    employeeId: 103, // Козлов (hypothetically)
    successorStatus: 'Ready now',
    readiness: '6-12 months',
    isApproved: true,
    approvalDate: '2023-10-01',
  },
  {
    id: 202,
    managerId: 102, // Смирнова
    employeeId: 101, // Иванов
    successorStatus: 'Ready now',
    readiness: 'Immediate',
    isApproved: true,
    approvalDate: '2023-09-15',
  },
];

// 4. Teams (Manager ID -> Subordinates)
// In a real system, this would be separate employees with managerId = manager.id
export const MOCK_TEAMS: Record<number, Employee[]> = {
  101: [ // Team for Ivanov
    {
      id: 106,
      fullName: 'Морозов Артем Дмитриевич',
      domain: 'IT',
      position: 'Senior Java Developer',
      grade: 5,
      critical: false,
      assessment360: 'Выше ожидаемого',
      era: 'Player',
      developmentProgram: 'Backend Mastery',
      potential: 'High',
      performance: 'High',
      careerStatus: 'Growing',
    },
  ],
  102: [ // Team for Smirnova
    {
      id: 107,
      fullName: 'Новикова Ольга Сергеевна',
      domain: 'HR',
      position: 'HR Business Partner',
      grade: 5,
      critical: false,
      assessment360: 'Соответствует',
      era: 'Player',
      developmentProgram: 'General HR',
      potential: 'Medium',
      performance: 'Medium',
      careerStatus: 'Stable',
    },
  ],
};

// --- API Response Generators ---

export function getMockLoginResponse(username: string): LoginResponse | null {
  const user = MOCK_USERS.find((u) => u.username === username);
  if (!user) return null;
  
  return {
    token: `mock_jwt_token_${user.id}`,
    username: user.username,
    role: user.role, // Returns 'ADMIN', 'MANAGER', etc.
    fullName: user.fullName,
  };
}

export function getMockStats(): DashboardStats {
  // Simple static calculation based on mock data
  return {
    managersWithSuccessors: 2, // Ivanov, Smirnova
    managersWithoutSuccessors: 3,
    criticalRoles: 4,
    criticalRolesWithSuccessors: 2,
    criticalRolesWithoutSuccessors: 2,
    nonCriticalRoles: 1,
    nonCriticalRolesWithSuccessors: 0,
    nonCriticalRolesWithoutSuccessors: 1,
  };
}

export function getMockNineBox() {
  return {
    totalManagers: 5,
    cells: {
      'HH': { managers: 2, successors: 1, nonSuccessors: 1 },
      'HM': { managers: 1, successors: 0, nonSuccessors: 1 },
      'MH': { managers: 1, successors: 1, nonSuccessors: 0 },
      'ML': { managers: 1, successors: 0, nonSuccessors: 1 },
      'LL': { managers: 0, successors: 0, nonSuccessors: 0 },
      // ... other cells
    },
  };
}

export function getMockMeta() {
  return {
    minGrade: 5,
    maxGrade: 8,
    availableDomains: ['IT', 'HR', 'Finance', 'Sales'],
  };
}

