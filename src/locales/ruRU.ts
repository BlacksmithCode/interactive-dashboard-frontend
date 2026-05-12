// src/locales/ruRU.ts
export const RU_RU_LOCALE = {
  // Тулбар
  toolbarColumns: "Колонки",
  toolbarFilters: "Фильтры",
  toolbarDensity: "Плотность",
  toolbarExport: "Экспорт",
  toolbarQuickFilterPlaceholder: "Поиск…",

  // Меню колонки
  columnMenuSortAsc: "Сортировать по возрастанию",
  columnMenuSortDesc: "Сортировать по убыванию",
  columnMenuHideColumn: "Скрыть колонку",
  columnMenuManageColumns: "Управление колонками",
  columnsManagementSearchTitle: "Найти колонку",
  columnsManagementShowHideAllText: "Показать/скрыть все",
  columnsManagementReset: "Сбросить",

  // Фильтр
  filterPanelAddFilter: "Добавить фильтр",
  filterPanelRemoveAll: "Удалить все",
  filterPanelDeleteIconLabel: "Удалить",
  filterPanelLogicOperator: "Логический оператор",
  filterPanelOperator: "Оператор",
  filterPanelOperatorAnd: "И",
  filterPanelOperatorOr: "Или",
  filterPanelColumn: "Колонка",
  filterPanelInputLabel: "Значение",
  filterPanelInputPlaceholder: "Введите значение",

  // Операторы фильтрации
  filterOperatorContains: "содержит",
  filterOperatorEquals: "равно",
  filterOperatorStartsWith: "начинается с",
  filterOperatorEndsWith: "заканчивается на",
  filterOperatorIsEmpty: "пусто",
  filterOperatorIsNotEmpty: "не пусто",
  filterOperatorIsAnyOf: "любой из",

  // Плотность
  toolbarDensityLabel: "Плотность",
  toolbarDensityCompact: "Компактно",
  toolbarDensityStandard: "Стандартно",
  toolbarDensityComfortable: "Удобно",

  // Строки состояния
  footerRowSelected: (count: number) =>
    count === 0
      ? "Строки не выбраны"
      : `Выбрано строк: ${count.toLocaleString()}`,
  footerTotalRows: "Всего строк:",

  // Сортировка
  columnHeaderSortIconLabel: "Сортировать",

  // Пустые данные
  noRowsLabel: "Нет данных",
  noResultsOverlayLabel: "Результатов не найдено",
  // Пагинация
  // Текст надписи "Rows per page" в нижней панели пагинации
  labelRowsPerPage: "Строк на странице:",
  // Формат отображения диапазона строк, например "1–10 из 100"
  labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
    `${from}–${to} из ${count !== -1 ? count : `более чем ${to}`}`,
  // Текст для aria‑атрибутов кнопок навигации (first, last, next, previous)
  // Эти строки используются в компоненте TablePagination, но добавляем их сюда
  // для полной локализации через localeText, если понадобится.
  // MUI DataGrid использует эти ключи: "first", "last", "next", "previous"
  // Мы предоставляем их как fallback.
  firstTooltip: "На первую страницу",
  lastTooltip: "На последнюю страницу",
  nextTooltip: "На следующую страницу",
  previousTooltip: "На предыдущую страницу",
} as any; // eslint-disable-line @typescript-eslint/no-explicit-any
