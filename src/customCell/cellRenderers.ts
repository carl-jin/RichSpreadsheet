import type {
  CellRenderersParams,
  CellRenderersMouseEventParams,
  CellRenderersMouseClickParams,
  FormatValueBeforeRenderParams,
  ExtractDomConfig,
} from "./types";
import { CustomBase } from "./customBase";

abstract class CellRenderers extends CustomBase {
  //  cell 渲染方法
  abstract render(CellRenderersParams: CellRenderersParams): void;

  //  鼠标移入单元格时的渲染
  abstract mouseenterRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void;

  //  鼠标在单元格中移动时的渲染
  abstract mousemoveRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void;

  //  鼠标移开单元格时的渲染
  abstract mouseoutRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void;

  //  鼠标点击单元格时的渲染
  abstract clickRender(
    CellRenderersMouseClickParams: CellRenderersMouseClickParams
  ): void;

  //  鼠标移入单元格时, 显示额外的 dom节点
  abstract showExtractDomOnMouseEnter(
    CellRenderersParams: CellRenderersParams
  ): ExtractDomConfig;

  //  在进入渲染 Render 前, 提前处理 value 值
  abstract formatValueBeforeRender(
    FormatValueBeforeRenderParams: FormatValueBeforeRenderParams
  ): any;

  //  在 paste 执行插入之前, 将数据进行格式化
  abstract parseFromClipboard(value: any, cellParams: any): string;
}

export { CellRenderers };
