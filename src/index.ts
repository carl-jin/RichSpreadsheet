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
  CellRenderersMouseClickParams
} from "./cellRenderers/cellRenderers";
export { CellRenderers } from "./cellRenderers/cellRenderers";
export default RichSpread;
export * from "./type";
