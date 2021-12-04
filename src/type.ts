import { CellRenderers } from "./cellRenderers/cellRenderers";

export type RichSpreadsheetParams = Partial<{
  cellRenderers: {
   [key:string] : CellRenderers;
  };
  [key: string]: any;
}>;
