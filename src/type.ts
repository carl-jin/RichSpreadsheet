import { CellRenderers } from "./customCell/cellRenderers";
import { CellEditors } from "./customCell/cellEditors";
import { cell } from "./customCell/types";

export type RichSpreadsheetParams = Partial<{
  cellRenderers: {
    [key: string]: CellRenderers;
  };
  cellEditors: {
    [key: string]: CellEditors;
  };
  onReadonlyCellTryToEdit(): void;
  onCellUpdate(params: {
    colIndex: number;
    rowIndex: number;
    oldCell: cell;
    newCell: cell;
    value: string;
    isRefresh: boolean;
  }): void;
  [key: string]: any;
}>;
