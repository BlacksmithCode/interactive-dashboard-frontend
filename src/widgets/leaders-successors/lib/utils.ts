import type { GridRowParams } from "@mui/x-data-grid";
import type { ManagerListItem } from "@/entities/leader/model/types";

export const capitalizeFirstLetter = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getRowClassName = (params: GridRowParams<ManagerListItem>) =>
  params.row.hasSuccessor ? "" : "row-without-successor";