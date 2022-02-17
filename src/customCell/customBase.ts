import Store from "../store";
import formula from "../global/formula";
import type { CellRenderersParams } from "./types";
import { decomposeMatrix2DW3, getFrozenAreaThatCellIn } from "./helper/tools";
import { luckysheetrefreshgrid } from "../global/refresh";
import {
  finishEdit,
  reFreshCellByCoord,
  startEdit,
} from "./helper/baseMethods";

export class CustomBase {
  private asyncTimer = {};

  /**
   * 关闭编辑, 更新值
   */
  protected finishEdit() {
    finishEdit();
  }

  /**
   * 重新渲染当前表格
   */
  protected reFreshGridAsync() {
    if (this.asyncTimer[`all`]) {
      window.clearTimeout(this.asyncTimer[`all`]);
    }
    this.asyncTimer[`all`] = setTimeout(() => {
      this.reFreshGrid();
    }, 100);
  }

  /**
   * 重新渲染当前表格
   */
  protected reFreshGrid() {
    luckysheetrefreshgrid();
  }

  /**
   * 刷新指定单元格 异步方法
   * 因为部分单元格数据更新是异步的，同步刷新会导致数据还未更新完
   * 这样直接刷新的话，还是老数据
   * @param rowIndex
   * @param colIndex
   * @protected
   */
  protected reFreshCellByCoordAsync(rowIndex: number, colIndex: number) {
    if (this.asyncTimer[`${rowIndex}_${colIndex}`]) {
      window.clearTimeout(this.asyncTimer[`${rowIndex}_${colIndex}`]);
    }
    this.asyncTimer[`${rowIndex}_${colIndex}`] = setTimeout(() => {
      this.reFreshCellByCoord(rowIndex, colIndex);
    }, 100);
  }

  /**
   * 刷新指定单元格
   * @param rowIndex
   * @param colIndex
   * @protected
   */
  protected reFreshCellByCoord(rowIndex: number, colIndex: number) {
    reFreshCellByCoord(rowIndex, colIndex);
  }

  /**
   * 停止编辑, 不会更新值
   */
  protected stopEdit() {
    formula.dontupdate();
    setTimeout(() => {
      $(".luckysheet-grid-window-2").focus();
    }, 100);
  }

  //  直接进入编辑状态
  protected startEdit(CellRenderersParams: CellRenderersParams) {
    startEdit(CellRenderersParams);
  }

  /**
   * 清理单元格内容
   */
  protected clearCell(CellRenderersParams: CellRenderersParams) {
    const {
      ctx,
      positionX,
      positionY,
      cellWidth,
      cellHeight,
      rowIndex,
      colIndex,
    } = CellRenderersParams;

    const cellArea = getFrozenAreaThatCellIn(rowIndex, colIndex);
    //  只有在最左侧的区域才需要处理偏移值
    const isInTheLeftEdge = ~cellArea.indexOf("left");
    const offsetLeft = isInTheLeftEdge
      ? positionX + Store.rowHeaderWidth
      : positionX;

    let left = positionX;
    let width = cellWidth;
    //  判断是否会盖住 row header
    //  如果盖住的话，处理下 left 的偏移
    if (offsetLeft < Store.rowHeaderWidth) {
      left = Store.rowHeaderWidth;
      width = cellWidth - (left - positionX);
    }

    ctx.beginPath();
    ctx.save();
    ctx.rect(left, positionY, width - 1, cellHeight - 1);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.restore();
    ctx.closePath();
  }

  /**
   * 设置 Cell 的 clip 范围, 请务必在渲染后调用 remoteCellClip
   * @param CellRenderersParams
   */
  protected startCellClip(CellRenderersParams: CellRenderersParams) {
    const {
      ctx,
      positionX,
      positionY,
      cellWidth,
      cellHeight,
      rowIndex,
      colIndex,
    } = CellRenderersParams;

    const cellArea = getFrozenAreaThatCellIn(rowIndex, colIndex);
    //  只有在最左侧的区域才需要处理偏移值
    const isInTheLeftEdge = ~cellArea.indexOf("left") || cellArea === "top";
    const offsetLeft = isInTheLeftEdge
      ? positionX + Store.rowHeaderWidth
      : positionX;

    let left = positionX;
    let width = cellWidth;
    //  判断是否会盖住 row header
    //  如果盖住的话，处理下 left 的偏移
    if (offsetLeft < Store.rowHeaderWidth) {
      left = Store.rowHeaderWidth;
      width = cellWidth - (left - positionX);
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(left, positionY - 1, width - 1, cellHeight);
    ctx.clip();
  }

  /**
   * 清理 Cell 的 clip 范围
   * @param CellRenderersParams
   */
  protected closeCellClip(CellRenderersParams: CellRenderersParams) {
    const { ctx, positionX, positionY, cellWidth, cellHeight } =
      CellRenderersParams;
    ctx.closePath();
    ctx.restore();
  }

  /**
   * 设置 devicePixelRatio 因为部分控件（如富文本，图片）是延迟渲染
   * 这时 restore 已经执行过了，所以需要单独设置下
   * @param CellRenderersParams
   * @protected
   */
  protected setDevicePixelRatio(CellRenderersParams: CellRenderersParams) {
    const { ctx } = CellRenderersParams;
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
   * @param CellRenderersParams
   * @protected
   */
  protected closeDevicePixelRatio(CellRenderersParams: CellRenderersParams) {
    const { ctx } = CellRenderersParams;
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
   * 更新 cell 的值 直接调用 formula.updatecell
   * @param r
   * @param c
   * @param value
   * @protected
   */
  protected updateCell(r, c, value) {
    Store.luckysheetCellUpdate = [r, c];
    formula.updatecell(r, c, value);
  }

  /**
   * 获取 Store
   * @protected
   */
  protected getStore() {
    return Store;
  }
}
