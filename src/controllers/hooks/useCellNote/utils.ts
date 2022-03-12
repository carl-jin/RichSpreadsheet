import type { Note } from "./types";
import {
  getColumnIndexByColumnId,
  getCurrentSheet,
  getRowIndexByRowId,
  refresh,
  refreshCellById,
} from "../../../global/apiHelper";
import { defaultNoteHeight, defaultNoteWidth } from "./index";
import Store from "../../../store";
import { removeDom } from "./useShowCellNoteDom";
import { canvasMouseClick } from "../useMouseClick";
import { selectHightlightShow } from "../../select";
import { getMouseRelateCell } from "../../handler";

function getNoteConfigById(rowId: string, colId: string): Note | null {
  let target = window.richSpreadSheetCellNote.find(
    (item) => item.rowId === rowId && item.colId === colId
  );
  return target ? target : null;
}

/**
 * 更新单元格的 note 信息
 * @param notes
 */
export function updateCellsNote(notes: Note[]): void {
  window.richSpreadSheetCellNote = notes;
  refresh();
}

/**
 * 更新指定单元格的 size
 * @param rowId
 * @param colId
 * @param size
 * @param silent
 */
export function updateCellNoteSizeById(
  rowId: string,
  colId: string,
  size: [number, number],
  silent: boolean = false
) {
  let target = getNoteConfigById(rowId, colId);

  if (target) {
    target.width = size[0];
    target.height = size[1];
    refreshCellById(rowId, colId);

    !silent &&
      Store.$emit("CellNoteUpdate", {
        rowId,
        colId,
        note: target.note,
        width: target.width,
        height: target.height,
      });
  }
}

/**
 * 更新指定单元格的 note 信息
 * @param rowId
 * @param colId
 * @param note
 * @param silent
 */
export function updateCellNoteId(
  rowId: string,
  colId: string,
  note: string,
  silent: boolean = false
): void {
  let target = getNoteConfigById(rowId, colId);

  if (target) {
    target.note = note;

    !silent &&
      Store.$emit("CellNoteUpdate", {
        rowId,
        colId,
        note: target.note,
        width: target.width,
        height: target.height,
      });
  } else {
    window.richSpreadSheetCellNote.push({
      rowId,
      colId,
      note,
      width: defaultNoteWidth,
      height: defaultNoteHeight,
    });

    !silent &&
      Store.$emit("CellNoteUpdate", {
        rowId,
        colId,
        note: note,
        width: defaultNoteWidth,
        height: defaultNoteHeight,
      });
  }

  refreshCellById(rowId, colId);
}

/**
 * 隐藏 note
 */
export function removeCellNote(): void {
  removeDom(null, true);
}

/**
 * 显示指定单元格的 note ， 没有的话就新建
 * @param rowId
 * @param colId
 */
export function showCellNoteById(rowId: string, colId: string): void {
  let target = getNoteConfigById(rowId, colId);
  if (!target) {
    target = {
      rowId,
      colId,
      note: "",
      width: defaultNoteWidth,
      height: defaultNoteHeight,
    };

    updateCellNoteId(rowId, colId, "", true);
  }

  triggerCellMousedown(rowId, colId);

  setTimeout(() => {
    $(".rich-spreadsheet-cell-note-dom .note-wrapper").focus();
  }, 200);
}

/**
 * 删除指定单元格的 note 信息
 * @param rowId
 * @param colId
 */
export function deleteCellNoteById(rowId: string, colId: string): void {
  let target = getNoteConfigById(rowId, colId);

  if (target) {
    let index = window.richSpreadSheetCellNote.indexOf(target);
    window.richSpreadSheetCellNote.splice(index, 1);
  }

  refreshCellById(rowId, colId);
}

/**
 * 判断指定单元格是否有 note 信息
 * @param rowId
 * @param colId
 */
export function isCellHasNoteById(rowId: string, colId: string): boolean {
  let target = getNoteConfigById(rowId, colId);

  return !!target;
}

/**
 * 获取指定单元格的 note 信息
 * @param rowId
 * @param colId
 */
export function getNoteById(rowId: string, colId: string): string {
  let target = getNoteConfigById(rowId, colId);

  return target ? target.note : "";
}

/**
 * 获取指定单元格 note 的宽高
 * @param rowId
 * @param colId
 */
export function getNoteSizeById(rowId: string, colId: string): [number, number] {
  let target = getNoteConfigById(rowId, colId);

  if (!target) return [defaultNoteWidth, defaultNoteHeight];

  return [target.width, target.height];
}

/**
 * 触发指定单元格的 mousedown 事件
 */
function triggerCellMousedown(rowId, colId) {
  let rowIndex = getRowIndexByRowId(rowId);
  let colIndex = getColumnIndexByColumnId(colId);
  const currentSheet = getCurrentSheet();
  const { visibledatacolumn, visibledatarow } = currentSheet;
  const columnX =
    (colIndex === 0 ? 0 : visibledatacolumn[Math.max(0, colIndex - 1)]) + 20;
  const rowY =
    (rowIndex === 0 ? 0 : visibledatarow[Math.max(0, rowIndex - 1)]) + 20;
  const $main = $("#luckysheet-cell-main");
  const scrollLeft = $main.scrollLeft();
  const scrollTop = $main.scrollTop();

  let event = $.Event("click");
  let { left, top } = $("#" + Store.container).offset();

  //  @ts-ignore
  event.target = $(".luckysheet-cell-sheettable").get(0);
  //  03/05 处理 选择控件在一屏之后 快速编辑失效，是因为下面这个 pageY 没有减去 scrollLeft 导致的
  //  但是印象中在处理 unfolding 时，因为减去 scrollLeft 会有 bug，但是这次未复现
  event.pageX = columnX + left + Store.rowHeaderWidth - scrollLeft;
  event.pageY = rowY + top + Store.columnHeaderHeight - scrollTop;

  //  处理单元格点击渲染
  canvasMouseClick(event);
  const mouseDetail = getMouseRelateCell(event);
  let {
    row_location,
    row,
    row_pre,
    row_index,
    col_location,
    col,
    col_pre,
    col_index,
  } = mouseDetail;

  //  模拟选中
  Store.luckysheet_select_save.length = 0;
  Store.luckysheet_select_save.push({
    left: col_pre,
    width: col - col_pre - 1,
    top: row_pre,
    height: row - row_pre - 1,
    left_move: col_pre,
    width_move: col - col_pre - 1,
    top_move: row_pre,
    height_move: row - row_pre - 1,
    row: [row_index, row_index],
    column: [col_index, col_index],
    row_focus: row_index,
    column_focus: col_index,
  });

  selectHightlightShow();
}
