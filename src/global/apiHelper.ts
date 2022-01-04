import Store from "../store";
import { getSheetIndex } from "../methods/get";
import {
  frozenRowRange,
  frozenColumnRange,
  setBothFrozen,
  cancelFrozen,
} from "./api";
import {
  deepClone,
  getRowIndexByRowId,
  getRowsIdFromSelectedSave,
} from "../controllers/hooks/helper";
import { getCellByRowIndexFromCellData as _getCellByRowIndexFromCellData } from "../controllers/hooks/helper";
import {
  setCopyToClipboard as _setCopyToClipboard,
  pasteFromClipboard as _pasteFromClipboard,
} from "../controllers/hooks/useGsClipboard";
import { setcellvalue as _setcellvalue } from "./setdata";

/**
 * 将 cell 的值与 cellData 同步
 * @param data
 */
export function syncWidthCellData<T>(data: T): T {
  const currentSheet = getCurrentSheet();
  const columns = currentSheet.column;
  const cellData = getCellData();

  // @ts-ignore
  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < columns.length; col++) {
      const columnId = columns[col]
        ? columns[col].id ?? columns[col].fieldId
        : "";
      const rowId = cellData[row] ? cellData[row].id ?? "" : "";
      let value = "";

      if (data[row][col] === null) {
        //  data[row][col] 但是对应 cellData 中还是有值，代表着这个是新增加的 cell
        //  因为除此之外不会出现 data[row][col] 为 null 的情况
        if (cellData[row] && cellData[row][columnId]) {
          value = cellData[row][columnId];
        }
      } else {
        value = data[row][col].v;
      }

      data[row][col] = {
        v: value,
        columnId,
        rowId,
      };
    }
  }
  return data;
}

/**
 * 更新指定单元格的值
 * @param row
 * @param col
 * @param value
 */
export function updateSpecificCellData(row, col, value) {
  const data = getCellData();
  const currentSheet = getCurrentSheet();
  const columns = currentSheet.column;
  const columnId = columns[col].id ?? columns[col].field;
  data[row][columnId] = value;

  setCellData(data);
}

/**
 * 获取当前 sheet
 */
export function getCurrentSheet() {
  return Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)];
}

/**
 * 获取 cellData
 */
export function getCellData() {
  let currentSheet = getCurrentSheet();
  return currentSheet.celldata;
}

/**
 * 获取 cell 对应行
 * @param rowIndex
 */
export function getCellByRowIndexFromCellData(rowIndex) {
  return _getCellByRowIndexFromCellData(rowIndex);
}

/**
 * 通过 columnId 获取 column index
 * @param colId
 */
export function getColumnIndexByColumnId(colId: string): number {
  let currentSheet = getCurrentSheet();
  let column = currentSheet.column.find((column) => column.id === colId);
  return currentSheet.column.indexOf(column);
}

/**
 * 获取 column 通过 col_index
 * @param colIndex
 */
export function getColumnByColIndex(colIndex) {
  let currentSheet = getCurrentSheet();

  return currentSheet.column[colIndex];
}

/**
 * 设置 cellData
 * @param data
 */
export function setCellData(data) {
  let currentSheet = getCurrentSheet();
  currentSheet.celldata = data;
}

/**
 * 兼容的取消冻结
 * @param cancelType
 */
export function cancelFrozenHacks(cancelType: "row" | "column") {
  const currentFrozenRange = deepClone(getCurrentSheet().frozen?.range ?? {});
  const isBothFrozen = getCurrentSheet().frozen?.type === "rangeBoth";

  //  只取消行
  if (cancelType === "row" && currentFrozenRange.column_focus && isBothFrozen) {
    // @ts-ignore
    frozenColumnRange({
      column_focus: currentFrozenRange.column_focus,
    });
    return;
  }

  //  只取消列
  if (cancelType === "column" && currentFrozenRange.row_focus && isBothFrozen) {
    // @ts-ignore
    frozenRowRange({
      row_focus: currentFrozenRange.row_focus,
    });
    return;
  }

  // @ts-ignore
  cancelFrozen();
}

/**
 * 获取当前选中的 row ids
 */
export function getSelectedRowIds() {
  return getRowsIdFromSelectedSave();
}

/**
 * 兼容设置冻结
 * @param range
 */
export function setFrozen(range: Partial<{ col: number; row: number }>) {
  const { row = null, col = null } = range;
  const currentFrozenRange = getCurrentSheet().frozen?.range ?? {};

  //  只冻结行
  //  {row:2}
  if (row !== null && !currentFrozenRange.column_focus) {
    // @ts-ignore
    frozenRowRange({
      row_focus: row,
    });
    return;
  }

  //  只冻结列
  //  {col:2}
  if (col !== null && !currentFrozenRange.row_focus) {
    // @ts-ignore
    frozenColumnRange({
      column_focus: col,
    });
    return;
  }

  //  两个都冻结
  if (
    (col !== null && currentFrozenRange.row_focus !== null) ||
    (row !== null && currentFrozenRange.column_focus !== null)
  ) {
    // @ts-ignore
    setBothFrozen(true, {
      range: {
        column_focus: col !== null ? col : currentFrozenRange.column_focus,
        row_focus: row !== null ? row : currentFrozenRange.row_focus,
      },
    });
    return;
  }
}

/**
 * 显示加载中
 */
export function showLoading() {
  Store.loadingObj.show();
}

/**
 * 隐藏加载中
 */
export function hideLoading() {
  Store.loadingObj.close();
}

/**
 * 将指定的 单元格 数据塞入到 clipboard 中
 * @param rowIndexArr
 * @param colIndexArr
 */
export function setCopyToClipboard(
  rowIndexArr: number[],
  colIndexArr: number[]
) {
  return _setCopyToClipboard(rowIndexArr, colIndexArr);
}

/**
 * 从 clipboard 获取数据, 更新到当前选中的单元格
 */
export function pasteFromClipboard() {
  return _pasteFromClipboard();
}

/**
 * 设置 cell 的值
 * @param r rowIndex
 * @param c colIndex
 * @param v value
 * @param options
 */
export function setCellValue(r, c, v, options = {}) {
  return _setcellvalue(r, c, null, v, options);
}

/**
 * 通过 cellData 中的 rowId 和 colId 来更新值
 * @param rowId
 * @param colId
 * @param value
 * @param options∏
 */
export function setCellValueById(rowId, colId, value, options = {}) {
  const colIndex = getColumnIndexByColumnId(colId);
  const rowIndex = getRowIndexByRowId(rowId);

  if (colIndex < 0 || rowIndex < 0) return;

  _setcellvalue(rowIndex, colIndex, null, value, options);
}

/**
 * 删除当前所选区域
 */
export function deleteCurrentSelection() {
  if (Store.luckysheet_select_save.length > 0) {
    for (let s = 0; s < Store.luckysheet_select_save.length; s++) {
      let r1 = Store.luckysheet_select_save[s].row[0],
        r2 = Store.luckysheet_select_save[s].row[1];
      let c1 = Store.luckysheet_select_save[s].column[0],
        c2 = Store.luckysheet_select_save[s].column[1];

      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          setCellValue(r, c, "", {
            reRenderCell: true,
          });
        }
      }
    }
  }
}

/**
 * 判断这个 rowIndex 存不存在
 * @param rowIndex
 */
export function isRowExisted(rowIndex) {
  const cellData = getCellData();
  return !!cellData[rowIndex];
}

/**
 * 判断这个 col 存不存在
 * @param colIndex
 */
export function isColExisted(colIndex) {
  let currentSheet = getCurrentSheet();
  return !!currentSheet.column[colIndex];
}
