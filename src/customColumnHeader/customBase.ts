import Store from "../store";
import type { ColumnTitleRenderParams } from "./types";
import {
  decomposeMatrix2DW3,
  getFrozenAreaThatCellIn,
} from "../customCell/helper/tools";

export class CustomBase {
  /**
   * 清理单元格内容
   */
  protected clearColumnTitle(ColumnTitleRenderParams: ColumnTitleRenderParams) {
    const { ctx, positionX, positionY, columnWidth, columnHeight, colIndex } =
      ColumnTitleRenderParams;

    const cellArea = getFrozenAreaThatCellIn(0, colIndex);
    //  只有在最左侧的区域才需要处理偏移值
    const isInTheLeftEdge = ~cellArea.indexOf("left");
    const offsetLeft = isInTheLeftEdge
      ? positionX + Store.rowHeaderWidth
      : positionX;

    let left = positionX;
    let width = columnWidth;
    //  判断是否会盖住 row header
    //  如果盖住的话，处理下 left 的偏移
    if (offsetLeft < Store.rowHeaderWidth) {
      left = Store.rowHeaderWidth;
      width = columnWidth - (left - positionX);
    }

    ctx.beginPath();
    ctx.save();
    ctx.rect(left, positionY, width - 2, columnHeight - 2);
    ctx.fillStyle = "#f5f5f5";
    ctx.fill();
    ctx.restore();
    ctx.closePath();
  }

  /**
   * 设置 column title 的 clip 范围, 请务必在渲染后调用 remove column clip
   * @param ColumnTitleRenderParams
   */
  protected startColumnTitleClip(
    ColumnTitleRenderParams: ColumnTitleRenderParams
  ) {
    const { ctx, positionX, positionY, columnWidth, columnHeight, colIndex } =
      ColumnTitleRenderParams;

    const cellArea = getFrozenAreaThatCellIn(0, colIndex);
    //  只有在最左侧的区域才需要处理偏移值
    const isInTheLeftEdge = ~cellArea.indexOf("left") || cellArea === "top";
    const offsetLeft = isInTheLeftEdge
      ? positionX + Store.rowHeaderWidth
      : positionX;

    let left = positionX;
    let width = columnWidth;
    //  判断是否会盖住 row header
    //  如果盖住的话，处理下 left 的偏移
    if (offsetLeft < Store.rowHeaderWidth) {
      left = Store.rowHeaderWidth;
      width = columnWidth - (left - positionX);
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(left, positionY, width - 1, columnHeight - 1);
    ctx.clip();
  }

  /**
   * 清理 Cell 的 clip 范围
   * @param ColumnTitleRenderParams
   */
  protected closeColumnTitleClip(
    ColumnTitleRenderParams: ColumnTitleRenderParams
  ) {
    const { ctx, positionX, positionY, columnWidth, columnHeight } =
      ColumnTitleRenderParams;
    ctx.closePath();
    ctx.restore();
  }

  /**
   * 设置 devicePixelRatio 因为部分控件（如富文本，图片）是延迟渲染
   * 这时 restore 已经执行过了，所以需要单独设置下
   * @param ColumnTitleRenderParams
   * @protected
   */
  protected setDevicePixelRatio(
    ColumnTitleRenderParams: ColumnTitleRenderParams
  ) {
    const { ctx } = ColumnTitleRenderParams;
    const { scaleX, scaleY } = decomposeMatrix2DW3(ctx.getTransform());

    ctx.save();
    if (
      scaleY !== Store.devicePixelRatio &&
      scaleX !== Store.devicePixelRatio
    ) {
      ctx.scale(Store.devicePixelRatio, Store.devicePixelRatio);
    }
  }

  /**
   * 与 setDevicePixelRatio 配合使用
   * @param ColumnTitleRenderParams
   * @protected
   */
  protected closeDevicePixelRatio(
    ColumnTitleRenderParams: ColumnTitleRenderParams
  ) {
    const { ctx } = ColumnTitleRenderParams;
    ctx.restore();
  }

  /**
   * 获取设备的 DevicePixelRatio
   * @protected
   */
  protected getDevicePixelRatio() {
    return Store.devicePixelRatio;
  }

  /**
   * 获取 Store
   * @protected
   */
  protected getStore() {
    return Store;
  }
}
