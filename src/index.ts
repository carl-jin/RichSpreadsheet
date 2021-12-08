import "./assets/iconfont/iconfont.css";
import "./assets/font-awesome/font-awesome.css";
import "./css/index.less";
import "./utils/math";
import "./less/index.less";
import { RichSpread } from "./core";
export type {
  CellRenderersParams,
  FormatValueBeforeRenderParams,
  CellRenderersMouseEventParams,
  CellRenderersMouseClickParams,
  EditParams,
  FormatValueBeforeEditParams,
} from "./customCell/types";
export { CellRenderers } from "./customCell/cellRenderers";
export { CellEditors } from "./customCell/cellEditors";
export default RichSpread;
export * from "./type";
