import type {
  CellRenderersParams,
  CellRenderersMouseEventParams,
  CellRenderersMouseClickParams,
  ExtractDomConfig,
} from "./types";
import { CustomBase } from "./customBase";

abstract class CellRenderers extends CustomBase {
  //  cell 渲染方法
  public abstract render(CellRenderersParams: CellRenderersParams): void;

  //  鼠标移入单元格时的渲染
  protected mouseenterRender?(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void;

  //  鼠标在单元格中移动时的渲染
  protected mousemoveRender?(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void;

  //  鼠标移开单元格时的渲染
  protected mouseoutRender?(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void;

  //  鼠标点击单元格时的渲染
  protected clickRender?(
    CellRenderersMouseClickParams: CellRenderersMouseClickParams
  ): void;

  //  鼠标双击单元格时的渲染
  protected dbClickRender?(
    CellRenderersMouseClickParams: CellRenderersMouseClickParams
  ): void;

  //  鼠标移入单元格时, 显示额外的 dom节点
  protected showExtractDomOnMouseEnter?(
    CellRenderersParams: CellRenderersParams
  ): ExtractDomConfig;
}

export { CellRenderers };
