import Store from "../../store";
import { getSheetIndex } from "../../methods/get";
import formula from "../../global/formula";
import type { CellRenderersParams } from "../types";
import {
  detectIsInFrozenByFrozenPosition,
  FrozenPositionArea,
  getFrozenAreaThatCellIn,
} from "./tools";
import { luckysheetDrawMain } from "../../global/draw";
import luckysheetFreezen from "../../controllers/freezen";

export function finishEdit() {
  if (Store.luckysheetCellUpdate.length > 0) {
    const [r, c] = Store.luckysheetCellUpdate;
    window["stopEditing"] = true;
    formula.updatecell(r, c);

    //  为了避免触发键盘上的其他事件，这里做个事件停止锁
    setTimeout(() => {
      window["stopEditing"] = false;
      $(".luckysheet-grid-window-2").focus();
    }, 100);
  } else {
    console.log("无法找到当前 row_index 和 col_index", Store);
  }
}

/**
 * 进入编辑状态
 * @param CellRenderersParams
 * @param force  如果为 true 时会忽略 cellDbClick 事件的返回值
 */
export function startEdit(
  CellRenderersParams: CellRenderersParams,
  force: boolean = true
) {
  const { colIndex: col, rowIndex: row } = CellRenderersParams;
  const currentSheet =
    Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)];
  const { visibledatacolumn, visibledatarow } = currentSheet;
  const columnX =
    (col === 0 ? 0 : visibledatacolumn[Math.max(0, col - 1)]) + 20;
  const rowY = (row === 0 ? 0 : visibledatarow[Math.max(0, row - 1)]) + 20;
  const $main = $("#luckysheet-cell-main");
  const scrollLeft = $main.scrollLeft();
  const scrollTop = $main.scrollTop();

  let event = $.Event("dblclick");
  let { left, top } = $("#" + Store.container).offset();

  //  @ts-ignore
  event.target = $(".luckysheet-cell-sheettable").get(0);
  //  03/05 处理 选择控件在一屏之后 快速编辑失效，是因为下面这个 pageY 没有减去 scrollLeft 导致的
  //  但是印象中在处理 unfolding 时，因为减去 scrollLeft 会有 bug，但是这次未复现
  event.pageX = columnX + left + Store.rowHeaderWidth - scrollLeft;
  event.pageY = rowY + top + Store.columnHeaderHeight - scrollTop;

  $(".luckysheet-cell-sheettable").trigger(event, [
    {
      fake: true,
      force,
    },
  ]);
}

export function reFreshCellByCoord(rowIndex: number, colIndex: number) {
  //  判断是否在冻结区域内
  const colFrozen = luckysheetFreezen.freezenverticaldata;
  const rowFrozen = luckysheetFreezen.freezenhorizontaldata;
  if (colFrozen !== null || rowFrozen !== null) {
    const currentFrozenPosition = getFrozenAreaThatCellIn(rowIndex, colIndex);
    const isInFrozen = detectIsInFrozenByFrozenPosition(currentFrozenPosition);

    //  逻辑请参考
    //  RichSpreadsheet/src/global/refresh.js
    //  luckysheetrefreshgrid 方法
    if (isInFrozen) {
      const $main = $("#luckysheet-cell-main");
      const scrollWidth = $main.scrollLeft();
      const scrollHeight = $main.scrollTop();
      const drawWidth = Store.luckysheetTableContentHW[0];
      const drawHeight = Store.luckysheetTableContentHW[1];

      //  左上角
      if (currentFrozenPosition === FrozenPositionArea.LEFT_TOP) {
        //  左上 canvas freezen_3
        luckysheetDrawMain(
          colFrozen[2],
          rowFrozen[2],
          colFrozen[0],
          rowFrozen[0],
          1,
          1,
          null,
          null,
          "freezen_3",
          {
            rowIndex,
            colIndex,
          }
        );
      }

      //  右上 canvas freezen_3
      if (currentFrozenPosition === FrozenPositionArea.RIGHT_TOP) {
        luckysheetDrawMain(
          scrollWidth + colFrozen[0] - colFrozen[2],
          rowFrozen[2],
          drawWidth - colFrozen[0] + colFrozen[2],
          rowFrozen[0],
          1,
          1,
          null,
          null,
          "freezen_4",
          {
            rowIndex,
            colIndex,
          }
        );
      }

      //  左下 canvas freezen_7
      if (currentFrozenPosition === FrozenPositionArea.LEFT_BOTTOM) {
        luckysheetDrawMain(
          colFrozen[2],
          scrollHeight + rowFrozen[0] - rowFrozen[2],
          colFrozen[0],
          drawHeight - rowFrozen[0] + rowFrozen[2],
          1,
          1,
          null,
          null,
          "freezen_7",
          {
            rowIndex,
            colIndex,
          }
        );
      }

      //  左侧
      if (currentFrozenPosition === FrozenPositionArea.LEFT) {
        luckysheetDrawMain(
          colFrozen[2],
          scrollHeight,
          colFrozen[0],
          drawHeight,
          1,
          1,
          null,
          null,
          "freezen_v",
          {
            rowIndex,
            colIndex,
          }
        );
      }

      if (currentFrozenPosition === FrozenPositionArea.TOP) {
        luckysheetDrawMain(
          scrollWidth,
          rowFrozen[2],
          drawWidth,
          rowFrozen[0],
          1,
          1,
          null,
          null,
          "freezen_h",
          {
            rowIndex,
            colIndex,
          }
        );
      }

      return;
    }
  }

  luckysheetDrawMain(null, null, null, null, null, null, null, null, null, {
    rowIndex,
    colIndex,
  });
}
