import { TablePagination, type TablePaginationProps } from "@mui/material";

export function RussianTablePagination(props: TablePaginationProps) {
  return (
    <TablePagination
      {...props}
      labelRowsPerPage="Строк на странице:"
      labelDisplayedRows={({ from, to, count }) =>
        `${from}–${to} из ${count !== -1 ? count : `более чем ${to}`}`
      }
      getItemAriaLabel={(type: string) => {
        if (type === "first") return "На первую страницу";
        if (type === "last") return "На последнюю страницу";
        if (type === "next") return "На следующую страницу";
        if (type === "previous") return "На предыдущую страницу";
        return type;
      }}
    />
  );
}