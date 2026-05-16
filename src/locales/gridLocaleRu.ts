import { ruRU } from '@mui/x-data-grid/locales';
import type { GridLocaleText } from '@mui/x-data-grid';

// Берём стандартную русскую локализацию
const baseLocale = ruRU.components.MuiDataGrid.defaultProps.localeText as GridLocaleText;

// Переопределяем формат отображения строк пагинации
export const gridLocaleRu: GridLocaleText = {
  ...baseLocale,
  paginationDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
    `${from}–${to} из ${count !== -1 ? count : `более чем ${to}`}`,
};