declare global {
  interface Window {
    //  因为 esm 没法公用相同的 const，比如在 A 文件中定义了 const a
    //  分别在文件 B C 中引入时，得到的却是两个不一样的 a
    //  所以在模块中将常量放到 window 上
    __luckysheetFreezen: any;
    __Store: any;
    __luckysheetDropCell: any;
  }
}
import "./css/index.less";
import "./utils/math";
import "./less/index.less";
export type {
  CellRenderersParams,
  CellRenderersMouseEventParams,
  CellRenderersMouseClickParams,
  EditParams,
  ExtractDomConfig,
} from "./customCell/types";
export { CellRenderers } from "./customCell/cellRenderers";
export { CellEditors } from "./customCell/cellEditors";
export { CellTransformer } from "./customCell/cellTransformer";
export type { Handler as GSClipboardHandler } from "gs-clipboard";
export * from "./type";
export * from "./customCell/helper/drawHelper";
export * from "./global/apiCellSync";
export * from "./global/apiHelper";
export * from "./global/sort";
import { RichSpread } from "./core";
export { RichSpread };
