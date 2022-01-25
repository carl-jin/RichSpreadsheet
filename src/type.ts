import { CellRenderers } from "./customCell/cellRenderers";
import { CellEditors } from "./customCell/cellEditors";
import { cell } from "./customCell/types";
import { GsClipboardOptions } from "gs-clipboard";
import {ContextMenuParams, ContextMenuType} from "./controllers/hooks/useContextMenu";
import {CellTransformer} from "./customCell/cellTransformer";

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
  cellTransformer:{
    [key:string]: CellTransformer;
  }
  GSClipboardOptions: GsClipboardOptions;
  ContextMenu(params: ContextMenuParams, type: ContextMenuType): ContentMenuItem[];
  rowTitleNumberRender(index:number): string | number;
  [key: string]: any;
}>;
