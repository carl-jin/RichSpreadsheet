import { CustomBase } from "./customBase";
import {
  ColumnHeaderRenderMouseEventParams,
  ColumnTitleRenderParams,
} from "./types";

abstract class ColumnTitleRenderers extends CustomBase {
  public abstract render(
    ColumnTitleRenderParams: ColumnTitleRenderParams
  ): void;

  //  鼠标 title 时的渲染
  protected mouseenterRender?(
    ColumnHeaderRenderMouseEventParams: ColumnHeaderRenderMouseEventParams
  ): void;

  //  鼠标移开 title 时的渲染
  protected mouseoutRender?(
    ColumnHeaderRenderMouseEventParams: ColumnHeaderRenderMouseEventParams
  ): void;
}

export { ColumnTitleRenderers };
