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
  getColumnsFromSelectedSave,
  getRowIndexByRowId as _getRowIndexByRowId,
  getRowsIdFromSelectedSave,
} from "../controllers/hooks/helper";
import { getCellByRowIndexFromCellData as _getCellByRowIndexFromCellData } from "../controllers/hooks/helper";
import {
  setCopyToClipboard as _setCopyToClipboard,
  pasteFromClipboard as _pasteFromClipboard,
} from "../controllers/hooks/useGsClipboard";
import { setcellvalue as _setcellvalue } from "./setdata";
import { sortColumnSeletion as _sortColumnSeletion } from "./sort";
import { jfrefreshgrid_rhcw } from "../global/refresh";
import { luckysheetContainerFocus } from "../utils/util";
import {
  luckysheetdefaultstyle,
  luckysheetdefaultFont,
} from "../controllers/constant";
import {
  detectIsInFrozenByFrozenPosition,
  getFrozenAreaThatCellIn,
} from "../customCell/helper/tools";
import {
  detectColumnInColumnGroup,
  handleColumnHiddenInColumnGroup,
} from "../hooks/useColumnsGroup";
import luckysheetFreezen from "../controllers/freezen";

/**
 * 根据 flowData 更新 cellData
 * @param data
 */
type cellData = {
  v: any;
  columnId: string;
  rowId: string;
};
export function regenerateCellDataByFlowData(data: cellData[][]) {
  let newCellData = [];
  data.map((row) => {
    let newRow: any = {};
    row.map(({ rowId, columnId, v }) => {
      newRow[columnId] = v;
    });
    newRow.id = row[0].rowId;
    newCellData.push(newRow);
  });

  setCellData(deepClone(newCellData));
}

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
 * 获取 column 通过 colId
 * @param colId
 */
export function getColumnById(colId) {
  const colIndex = getColumnIndexByColumnId(colId);
  let currentSheet = getCurrentSheet();

  return currentSheet.column[colIndex];
}

/**
 * 获取 columns
 */
export function getColumns() {
  let currentSheet = getCurrentSheet();
  return currentSheet.column;
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
 * 获取当前选中的 columns
 */
export function getSelectedColumns() {
  return getColumnsFromSelectedSave();
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
    if (detectColumnInColumnGroup(col)) {
      return;
    }

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
  const rowIndex = _getRowIndexByRowId(rowId);

  if (colIndex < 0 || rowIndex < 0) return;

  _setcellvalue(rowIndex, colIndex, null, value, options);
}

/**
 * 通过 row id 获取当前 index
 * @param rowId
 */
export function getRowIndexByRowId(rowId) {
  return _getRowIndexByRowId(rowId);
}

/**
 * 通过 row index 获取 row id
 * @param rowIndex
 */
export function getRowIdByRowIndex(rowIndex) {
  let currentSheet = getCurrentSheet();
  if (currentSheet.celldata[rowIndex]) {
    return currentSheet.celldata[rowIndex].id ?? "";
  } else {
    return "";
  }
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
 * 删除指定行 by index
 * @param rowIndex
 * @param colIndex
 */
export function deleteCellByIndex(rowIndex, colIndex) {
  setCellValue(rowIndex, colIndex, "", {
    reRenderCell: true,
  });
}

/**
 * 删除指定行 by id
 * @param rowId
 * @param colId
 */
export function deleteCellById(rowId, colId) {
  const rowIndex = getRowIndexByRowId(rowId);
  const colIndex = getColumnIndexByColumnId(colId);
  deleteCellByIndex(rowIndex, colIndex);
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

/**
 * 通过 value 值获取指定 column 下的 transformer 中 ParseValueToData 转换后的数据
 * @param colId
 * @param value
 */
export function getOutputFromColumnTransformerParseValueToDataByValue(
  colId,
  value
) {
  const column = getColumnById(colId);
  if (!column) return value;

  const transformer = Store.cellTransformer[column.type];
  if (!transformer) return value;

  return transformer.parseValueToData(value, column.cellParams, column);
}

/**
 * 通过 value 值获取指定 column 下的 transformer 中 FormatValueFromData 转换后的数据
 * @param colId
 * @param value
 */
export function getOutputFromColumnTransformerFormatValueFromDataByValue(
  colId,
  value
) {
  const column = getColumnById(colId);
  if (!column) return value;

  const transformer = Store.cellTransformer[column.type];
  if (!transformer) return value;

  return transformer.formatValueFromData(value, column.cellParams, column);
}

/**
 * 排序一列数据
 */
export function sortColumnSelection(colIndex, isAsc) {
  return _sortColumnSeletion(colIndex, isAsc);
}

/**
 * 删除指定的 index 的 column
 * @param index
 * @param stopEvent - 停止事件触发
 * @param stopHandleColumnGroup - 停止处理分组隐藏方法
 */
export function deleteColumnByIndex(
  index: number,
  stopEvent: boolean = false,
  stopHandleColumnGroup: boolean = false
) {
  //  删除 column
  let currentSheet = getCurrentSheet();
  let column = currentSheet.column[index];
  currentSheet.column.splice(index, 1);

  //  这里也需要把 flow 里面的数据删除下（cells）
  for (let row = 0; row < Store.flowdata.length; row++) {
    Store.flowdata[row].splice(index, 1);
  }

  $("#luckysheet-cell-selected").hide();
  $("#luckysheet-cols-h-hover").hide();
  $("#luckysheet-cols-menu-btn").hide();

  //
  //  下面需要做配置更新

  let cfg = currentSheet.config;
  {
    //  列宽配置变动
    let columnlen_new = {};
    if (cfg["columnlen"] == null) {
      cfg["columnlen"] = {};
    }

    for (let c in cfg["columnlen"]) {
      // @ts-ignore
      if (c < index) {
        columnlen_new[c] = cfg["columnlen"][c];
      } else {
        // @ts-ignore
        if (c > index) {
          //  @ts-ignore
          columnlen_new[c - 1] = cfg["columnlen"][c];
        }
      }
    }
    cfg["columnlen"] = columnlen_new;
  }

  {
    //隐藏列配置变动
    let colhidden_new = {};
    if (cfg["colhidden"] == null) {
      cfg["colhidden"] = {};
    }

    for (let c in cfg["colhidden"]) {
      // @ts-ignore
      if (c < index) {
        colhidden_new[c] = cfg["colhidden"][c];
        // @ts-ignore
      } else if (c > index) {
        // @ts-ignore
        colhidden_new[c - 1] = cfg["colhidden"][c];
      }
    }
    cfg["colhidden"] = colhidden_new;
  }

  {
    //  冻结变动
    if (currentSheet.frozen?.type === "rangeColumn") {
      let newColumnFocus = 0;
      let oldColumnFocus = currentSheet.frozen.range.column_focus;
      newColumnFocus =
        index <= oldColumnFocus ? oldColumnFocus - 1 : oldColumnFocus;

      if (newColumnFocus > 0 && newColumnFocus !== oldColumnFocus) {
        setFrozen({
          col: newColumnFocus,
        });
      } else {
        //  取消冻结
        cancelFrozenHacks("column");
      }
    }
  }

  currentSheet.config = cfg;

  !stopHandleColumnGroup && handleColumnHiddenInColumnGroup(index);
  !stopEvent && Store.$emit("ColumnDeleted", index);

  //行高、列宽 刷新
  jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
  regenerateCellDataByFlowData(Store.flowdata);
}

/**
 * 隐藏指定 index 的 column
 * @param index
 * @param stopEvent - 停止事件触发
 * @param stopHandleColumnGroup - 停止处理分组隐藏方法
 */
export function hideColumnByIndex(
  index: number,
  stopEvent: boolean = false,
  stopHandleColumnGroup: boolean = false
) {
  luckysheetContainerFocus();

  let cfg = $.extend(true, {}, Store.config);
  if (cfg["colhidden"] == null) {
    cfg["colhidden"] = {};
  }

  cfg["colhidden"][index] = 0;
  !stopEvent && Store.$emit("ColumnHidden", cfg["colhidden"]);

  //config
  Store.config = cfg;
  Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].config =
    Store.config;

  //行高、列宽 刷新
  jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);

  $("#luckysheet-cell-selected").hide();
  $("#luckysheet-cols-h-hover").hide();
  $("#luckysheet-cols-menu-btn").hide();

  !stopHandleColumnGroup && handleColumnHiddenInColumnGroup(index);
}

/**
 * 显示指定 index 的 column
 * @param index
 */
export function showColumnByIndex(index: number) {
  luckysheetContainerFocus();

  let cfg = $.extend(true, {}, Store.config);
  if (cfg["colhidden"] == null) {
    cfg["colhidden"] = {};
    return;
  }

  delete cfg["colhidden"][index];

  //config
  Store.config = cfg;
  Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)].config =
    Store.config;

  //行高、列宽 刷新
  jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);

  $("#luckysheet-cell-selected").hide();
  $("#luckysheet-cols-h-hover").hide();
  $("#luckysheet-cols-menu-btn").hide();
}

/**
 * 获取当前隐藏列
 */
export function getHiddenColumn() {
  if (!Store.config?.colhidden) {
    return [];
  }

  let hiddenColumn = [];
  Object.keys(Store.config.colhidden).map((colIndex) => {
    if (!Store.config.colhidden[colIndex]) {
      let column = getColumnByColIndex(colIndex);
      if (column && column.id) {
        hiddenColumn.push(column.id);
      }
    }
  });

  return hiddenColumn;
}

/**
 * 判断指定行是否可以编辑
 * @param row_index
 * @param isSkipEvent
 */
export function isRowEditable(row_index, isSkipEvent = false) {
  let cellData = getCellData();
  let target = cellData[row_index] ? cellData[row_index] : {};
  //  如果没有设置 __editable 则都可以编辑
  let isEditable = target.__editable === undefined ? true : target.__editable;

  if (!isEditable && !isSkipEvent) {
    window.clearTimeout(window.__RichsheetEditable);
    window.__RichsheetEditable = window.setTimeout(() => {
      Store.$emit("cellUnEditable");
    }, 200);
  }

  return isEditable;
}

/**
 * 判断当前行是否可以删除
 * @param row_index
 */
export function isRowDeletable(row_index) {
  let cellData = getCellData();
  let target = cellData[row_index] ? cellData[row_index] : {};

  //  如果没有设置 __deletable 则都可以编辑
  return target.__deletable === undefined ? true : target.__deletable;
}

export function getStore() {
  return Store;
}

/**
 * 获取表头默认字体
 */
export function getColumnTitleFont() {
  return luckysheetdefaultFont().replace(/^normal/, "bold");
}

/**
 * 获取表头字体样式
 */
export function getColumnTitleStyle() {
  return {
    font: luckysheetdefaultFont().replace(/^normal/, "bold"),
    fillStyle: "#333",
    textBaseline: luckysheetdefaultstyle.textBaseline,
  };
}

/**
 * 设置表头字体样式
 */
export function setColumnTitleStyle(ctx: CanvasRenderingContext2D) {
  const { font, fillStyle, textBaseline } = getColumnTitleStyle();

  ctx.font = font;
  ctx.fillStyle = fillStyle;
  ctx.textBaseline = textBaseline;
}

/**
 * 根据 rowindex 和 colindex 来获取对应单元格所在的 canvas 区域
 * 因为表格中有冻结效果时，页面会被拆封成几个部分
 * @param rowIndex
 * @param cellIndex
 */
export function getCtxByRowAndCellIndex(
  rowIndex: number,
  cellIndex: number
): CanvasRenderingContext2D {
  let position = getFrozenAreaThatCellIn(rowIndex, cellIndex);

  //  判断单元格是否在冻结区域，如果在冻结区域的话，返回冻结区域的 canvas
  //  注意：页面取消了冻结列功能，所以这里只有一种情况
  let canvas: HTMLCanvasElement = null;
  if (detectIsInFrozenByFrozenPosition(position)) {
    canvas = document.getElementById("freezen_v") as HTMLCanvasElement;
  } else {
    canvas = document.getElementById(
      "luckysheetTableContent"
    ) as HTMLCanvasElement;
  }

  return canvas.getContext("2d");
}

/**
 * 触发 UI 的消息事件
 * @param msg
 * @param type
 */
export function emitMessage(
  msg: string,
  type: "success" | "error" | "warning" | "info" | "loading" = "info"
) {
  Store.$emit("message", {
    msg,
    type,
  });
}
