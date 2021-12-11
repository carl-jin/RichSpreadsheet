import { CellRenderers } from "./customCell/cellRenderers";
import { CellEditors } from "./customCell/cellEditors";

export type RichSpreadsheetParams = Partial<{
  cellRenderers: {
    [key: string]: CellRenderers;
  };
  cellEditors: {
    [key: string]: CellEditors;
  };
  onReadonlyCellTryToEdit(): void;
  onCellUpdate(): void;
  [key: string]: any;
}>;
