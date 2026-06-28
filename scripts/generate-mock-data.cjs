// scripts/generate-mock-data.js
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', '1000+.json');
const outputFile = path.join(__dirname, '..', 'src', 'shared', 'api', 'generatedEmployees.ts');

if (!fs.existsSync(inputFile)) {
  console.error('❌ Ошибка: файл 1000+.json не найден в корне проекта.');
  process.exit(1);
}

try {
  const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  const employees = rawData.employees;

  if (!Array.isArray(employees)) {
    throw new Error('JSON должен содержать массив "employees"');
  }

  // 1. Присваиваем ID и мапим поля
  const nameToId = new Map();
  const mapped = employees.map((emp, index) => {
    const id = index + 1;
    nameToId.set(emp['ФИО сотрудника'], id);
    return {
      id,
      fullName: emp['ФИО сотрудника'],
      managerName: emp['ФИО руководителя'], // Временное поле для связи
      domain: emp['Домен'],
      position: emp['Должность'],
      grade: Number(emp['Грейд']),
      critical: emp['Критичная роль'] === 'Да',
      assessment360: emp['Оценка 360'] || '',
      era: emp['ЭРА'] || '',
      developmentProgram: emp['Программа'] || '',
      potential: emp['Потенциал'] || '',
      performance: emp['Результативность'] || '',
      careerStatus: emp['Статус карьерного маршрута'] || '',
      managerId: undefined
    };
  });

  // 2. Резолвим managerId (связываем сотрудника с руководителем)
  mapped.forEach(emp => {
    if (emp.managerName && nameToId.has(emp.managerName)) {
      emp.managerId = nameToId.get(emp.managerName);
    }
    delete emp.managerName; // Удаляем временное поле
  });

  // 3. Генерируем TS файл
  const ts = `// 🤖 АВТО-ГЕНЕРАЦИЯ: Не редактируй вручную!
// Запусти: node scripts/generate-mock-data.js
// Источник: 1000+.json

export interface MockEmployee {
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

export const MOCK_EMPLOYEES: MockEmployee[] = ${JSON.stringify(mapped, null, 2)};
`;

  fs.writeFileSync(outputFile, ts);
  console.log(`✅ Успешно сгенерировано ${mapped.length} сотрудников в src/shared/api/generatedEmployees.ts`);

} catch (e) {
  console.error('❌ Ошибка генерации:', e.message);
  process.exit(1);
}
