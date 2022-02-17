import { ColumnTitleRenderers, setColumnTitleStyle } from "../../src";
import type { ColumnTitleRenderParams } from "../../src";

export default class Select extends ColumnTitleRenderers {
  render(ColumnTitleRenderParams: ColumnTitleRenderParams): void {
    const { ctx, positionX, positionY, columnHeight, column } =
      ColumnTitleRenderParams;

    //  清理下单元格
    this.clearColumnTitle(ColumnTitleRenderParams);
    //  设置裁剪区域
    this.startColumnTitleClip(ColumnTitleRenderParams);

    setColumnTitleStyle(ctx);
    ctx.fillText(column.headerName, positionX, columnHeight / 2);

    //  关闭裁剪区域
    this.closeColumnTitleClip(ColumnTitleRenderParams);
  }

  mouseenterRender(ColumnTitleRenderParams: ColumnTitleRenderParams) {
    const { ctx, positionX, positionY, columnHeight } = ColumnTitleRenderParams;

    //  清理下单元格
    this.clearColumnTitle(ColumnTitleRenderParams);
    //  设置裁剪区域
    this.startColumnTitleClip(ColumnTitleRenderParams);

    setColumnTitleStyle(ctx);
    ctx.fillText("222", positionX, columnHeight / 2);

    //  关闭裁剪区域
    this.closeColumnTitleClip(ColumnTitleRenderParams);
  }

  mouseoutRender(ColumnTitleRenderParams: ColumnTitleRenderParams) {
    this.render(ColumnTitleRenderParams);
  }
}
