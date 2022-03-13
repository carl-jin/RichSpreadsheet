import { CellRenderers } from "./customCell/cellRenderers";
import { CellEditors } from "./customCell/cellEditors";
import { GsClipboardOptions } from "gs-clipboard";
import {
  ContextMenuParams,
  ContextMenuType,
} from "./controllers/hooks/useContextMenu";
import { CellTransformer } from "./customCell/cellTransformer";
import { ColumnTitleRenderers } from "./customColumnHeader/columnTitleRenderers";

export type ContentMenuItem = Partial<{
  name: string;
  icon: string;
  disabled: boolean;
  subMenus?: ContentMenuItem[];
  action(): void;
  separator: boolean;
  hide: boolean;
}>;

export type RichSpreadsheetParams = Partial<{
  cellRenderers: Record<string, CellRenderers>;
  cellEditors: Record<string, CellEditors>;
  cellTransformer: Record<string, CellTransformer>;
  ColumnTitleRenderers: Record<string, ColumnTitleRenderers>;
  GSClipboardOptions: GsClipboardOptions;
  ContextMenu(
    params: ContextMenuParams,
    type: ContextMenuType
  ): ContentMenuItem[];
  rowTitleNumberRender(index: number): string | number;
  sensitiveOperationDetect: false | number;
  sensitiveOperationDetectHandler(msg: string): Promise<boolean>;
  [key: string]: any;
}>;
