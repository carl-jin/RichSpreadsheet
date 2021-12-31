import Store from "../store";
import { getSheetIndex } from "../methods/get";
import formula from "../global/formula";
import type { CellRenderersParams } from "./types";
import { decomposeMatrix2DW3 } from "./helper/tools";
import { luckysheetrefreshgrid } from "../global/refresh";
import { luckysheetDrawMain } from "../global/draw";

export class CustomBase {
  private asyncTimer = {};

  /**
   * 关闭编辑, 更新值
   */
  protected finishEdit() {
    if (Store.luckysheetCellUpdate.length > 0) {
      const [r, c] = Store.luckysheetCellUpdate;
      window["stopEditing"] = true;
      formula.updatecell(r, c);

      //  为了避免触发键盘上的其他事件，这里做个事件停止锁
      setTimeout(() => {
        window["stopEditing"] = false;
      }, 200);
    } else {
      console.log("无法找到当前 row_index 和 col_index", Store);
    }
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
    luckysheetDrawMain(null, null, null, null, null, null, null, null, null, {
      rowIndex,
      colIndex,
    });
  }

  /**
   * 停止编辑, 不会更新值
   */
  protected stopEdit() {
    formula.dontupdate();
  }

  //  直接进入编辑状态
  protected startEdit(CellRenderersParams: CellRenderersParams) {
    const { colIndex: col, rowIndex: row } = CellRenderersParams;
    const currentSheet =
      Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)];
    const { visibledatacolumn, visibledatarow } = currentSheet;
    const columnX = visibledatacolumn[Math.max(0, col - 1)] + 20;
    const rowY = visibledatarow[Math.max(0, row - 1)] + 20;
    const $main = $("#luckysheet-cell-main");
    const scrollLeft = $main.scrollLeft();
    const scrollTop = $main.scrollTop();

    let event = $.Event("dblclick");
    let { left, top } = $("#" + Store.container).offset();

    //  @ts-ignore
    event.target = $(".luckysheet-cell-sheettable").get(0);
    event.pageX = columnX + left + Store.rowHeaderWidth - scrollLeft;
    event.pageY = rowY + top + Store.columnHeaderHeight - scrollTop;

    $(".luckysheet-cell-sheettable").trigger(event);
  }

  /**
   * 清理单元格内容
   */
  protected clearCell(CellRenderersParams: CellRenderersParams) {
    const { ctx, positionX, positionY, cellWidth, cellHeight } =
      CellRenderersParams;
    ctx.beginPath();
    ctx.save();
    ctx.rect(positionX, positionY, cellWidth - 1, cellHeight - 1);
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
    const { ctx, positionX, positionY, cellWidth, cellHeight } =
      CellRenderersParams;
    ctx.save();
    ctx.beginPath();
    ctx.rect(positionX, positionY, cellWidth - 1, cellHeight - 1);
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
