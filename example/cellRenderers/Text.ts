import {
  CellRenderers,
  CellRenderersMouseClickParams,
  FormatValueBeforeRenderParams,
  CellRenderersMouseEventParams,
  CellRenderersParams,
  ExtractDomConfig,
} from "../../src";
import { getTextDimension } from "../../src";

export class Text extends CellRenderers {
  render(CellRenderersParams: CellRenderersParams): void {
    const {
      ctx,
      value,
      positionX,
      positionY,
      spaceX,
      spaceY,
      cellHeight,
      cellWidth,
    } = CellRenderersParams;
    //  清理下单元格
    this.clearCell(CellRenderersParams);
    //  设置裁剪区域
    this.startCellClip(CellRenderersParams);

    ctx.fillStyle = "#000";
    ctx.font = "14px -apple-system";
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    const { width: textWidth, height: textHeight } = getTextDimension(
      ctx,
      value
    );
    const left = positionX + 6;
    const top = positionY + textHeight + (cellHeight - textHeight) / 2 - 4;
    ctx.fillText(value, left, top);

    //  关闭裁剪区域
    this.closeCellClip(CellRenderersParams);
  }

  clickRender(
    CellRenderersMouseClickParams: CellRenderersMouseClickParams
  ): void {}

  mouseenterRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void {}

  mousemoveRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void {}

  mouseoutRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void {}

  formatValueBeforeRender(
    FormatValueBeforeRenderParams: FormatValueBeforeRenderParams
  ): any {
    return FormatValueBeforeRenderParams.value;
  }

  parseFromClipboard(value: any, cellParams: any): string {
    return value
  }

  showExtractDomOnMouseEnter(
    CellRenderersParams: CellRenderersParams
  ): ExtractDomConfig {
    return {
      right: this.getFullContentExtractDom(CellRenderersParams.value),
    };
  }

  private getFullContentExtractDom(value: string): HTMLElement {
    const div = document.createElement("div");
    div.style.cssText = `
      padding: 6px 6px;
      max-width: 340px;
      min-width: 120px;
      min-height: 20px;
      max-height: 180px;
      white-space: normal;
      overflow: auto;
      overflow-x: hidden;
    `;

    div.innerHTML = value;

    return div;
  }
}
