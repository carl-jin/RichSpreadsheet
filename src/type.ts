import { CellRenderers } from "./customCell/cellRenderers";
import { CellEditors } from "./customCell/cellEditors";
import { cell } from "./customCell/types";
import { GsClipboardOptions } from "gs-clipboard";
import {ContextMenuParams, ContextMenuType} from "./controllers/hooks/useContextMenu";

export type ContentMenuItem = Partial<{
  name: string;
  icon: string;
  disabled: boolean;
  subMenus?: ContentMenuItem[];
  action(): void;
  separator: boolean;
}>;

export type RichSpreadsheetParams = Partial<{
  cellRenderers: {
    [key: string]: CellRenderers;
  };
  cellEditors: {
    [key: string]: CellEditors;
  };
  GSClipboardOptions: GsClipboardOptions;
  onReadonlyCellTryToEdit(): void;
  onCellUpdate(params: {
    colIndex: number;
    rowIndex: number;
    oldCell: cell;
    newCell: cell;
    value: string;
    isRefresh: boolean;
  }): void;
  ContextMenu(params: ContextMenuParams, type: ContextMenuType): ContentMenuItem[];
  [key: string]: any;
}>;
