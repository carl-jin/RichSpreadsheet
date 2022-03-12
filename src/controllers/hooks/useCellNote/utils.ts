import type { Note } from "./types";
import {
  getColumnByColIndex,
  getCurrentSheet,
  refresh,
  refreshCellByIndex,
} from "../../../global/apiHelper";
import { defaultNoteHeight, defaultNoteWidth } from "./index";
import { getCellDataRowByRowIndex } from "../helper";
import Store from "../../../store";
import { removeDom } from "./useShowCellNoteDom";

function getNoteConfigByIndex(rowIndex, colIndex): Note | null {
  let target = window.richSpreadSheetCellNote.find(
    (item) => item.rowIndex === rowIndex && item.colIndex === colIndex
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
 * @param rowIndex
 * @param colIndex
 * @param size
 * @param silent
 */
export function updateCellNoteSize(
  rowIndex: number,
  colIndex: number,
  size: [number, number],
  silent: boolean = false
) {
  let target = getNoteConfigByIndex(rowIndex, colIndex);

  if (target) {
    target.width = size[0];
    target.height = size[1];
    refreshCellByIndex(rowIndex, colIndex);

    !silent &&
      Store.$emit("CellNoteUpdate", {
        rowIndex,
        colIndex,
        note: target.note,
        width: target.width,
        height: target.height,
      });
  }
}

/**
 * 更新指定单元格的 note 信息
 * @param rowIndex
 * @param colIndex
 * @param note
 * @param silent
 */
export function updateCellNote(
  rowIndex: number,
  colIndex: number,
  note: string,
  silent: boolean = false
): void {
  let target = getNoteConfigByIndex(rowIndex, colIndex);

  if (target) {
    target.note = note;

    !silent &&
      Store.$emit("CellNoteUpdate", {
        rowIndex,
        colIndex,
        note: target.note,
        width: target.width,
        height: target.height,
      });
  } else {
    window.richSpreadSheetCellNote.push({
      rowIndex,
      colIndex,
      note,
      width: defaultNoteWidth,
      height: defaultNoteHeight,
    });

    !silent &&
      Store.$emit("CellNoteUpdate", {
        rowIndex,
        colIndex,
        note: note,
        width: defaultNoteWidth,
        height: defaultNoteHeight,
      });
  }

  refreshCellByIndex(rowIndex, colIndex);
}

/**
 * 隐藏 note
 */
export function removeCellNote(): void {
  removeDom(null, true);
}

/**
 * 显示指定单元格的 note ， 没有的话就新建
 * @param rowIndex
 * @param colIndex
 */
export function showCellNote(rowIndex: number, colIndex: number): void {
  let target = getNoteConfigByIndex(rowIndex, colIndex);
  if (!target) {
    target = {
      rowIndex,
      colIndex,
      note: "",
      width: defaultNoteWidth,
      height: defaultNoteHeight,
    };

    updateCellNote(rowIndex, colIndex, "", true);
  }

  triggerCellMousedown(rowIndex, colIndex);

  setTimeout(()=>{
    $(".rich-spreadsheet-cell-note-dom .note-wrapper").focus()
  },200)
}

/**
 * 删除指定单元格的 note 信息
 * @param rowIndex
 * @param colIndex
 */
export function deleteCellNote(rowIndex: number, colIndex: number): void {
  let target = getNoteConfigByIndex(rowIndex, colIndex);

  if (target) {
    let index = window.richSpreadSheetCellNote.indexOf(target);
    window.richSpreadSheetCellNote.splice(index, 1);
  }

  refreshCellByIndex(rowIndex, colIndex);
}

/**
 * 判断指定单元格是否有 note 信息
 * @param rowIndex
 * @param colIndex
 */
export function isCellHasNote(rowIndex: number, colIndex: number): boolean {
  let target = getNoteConfigByIndex(rowIndex, colIndex);

  return !!target;
}

/**
 * 获取指定单元格的 note 信息
 * @param rowIndex
 * @param colIndex
 */
export function getNote(rowIndex: number, colIndex: number): string {
  let target = getNoteConfigByIndex(rowIndex, colIndex);

  return target ? target.note : "";
}

/**
 * 获取指定单元格 note 的宽高
 * @param rowIndex
 * @param colIndex
 */
export function getNoteSize(
  rowIndex: number,
  colIndex: number
): [number, number] {
  let target = getNoteConfigByIndex(rowIndex, colIndex);

  if (!target) return [defaultNoteWidth, defaultNoteHeight];

  return [target.width, target.height];
}

/**
 * 触发指定单元格的 mousedown 事件
 */
function triggerCellMousedown(rowIndex, colIndex) {
  let row = rowIndex;
  let col = colIndex;
  const currentSheet = getCurrentSheet();
  const { visibledatacolumn, visibledatarow } = currentSheet;
  const columnX =
    (col === 0 ? 0 : visibledatacolumn[Math.max(0, col - 1)]) + 20;
  const rowY = (row === 0 ? 0 : visibledatarow[Math.max(0, row - 1)]) + 20;
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

  //  todo 这里计算有问题，他没有即使显示，也会出现重复问题

  $("#luckysheet-cell-main").trigger(event, [
    {
      fake: true,
    },
  ]);

  setTimeout(() => {
    $("#luckysheet-cell-main").trigger($.Event("mouseup"));
  }, 1000);
}
