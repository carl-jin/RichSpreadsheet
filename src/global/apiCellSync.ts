import {
  insertRowOrColumn,
  insertRowBottomOrColumnRight,
  deleteRowOrColumn,
} from "./api";
import { getCellData, getCurrentSheet, setCellData } from "./apiHelper";

/**
 * 向上方插入一行/多行
 * @param type
 * @param start
 * @param rows
 */
export function insertRowOrColumnCellSync(
  type: "row" | "column",
  start: number,
  rows: any[]
) {
  //  更新下 cellData
  const cellData = getCellData();
  cellData.splice(start, 0, ...rows);
  setCellData(cellData);

  // @ts-ignore
  insertRowOrColumn(type, start, {
    number: rows.length,
  });
}

/**
 * 向上方插入一行/多行
 * @param type
 * @param start
 * @param rows
 * @param silent
 */
export function insertRowBottomOrColumnRightCellSync(
  type: "row" | "column",
  start: number,
  rows: any[],
  silent = false
) {
  //  更新下 cellData
  const cellData = getCellData();
  cellData.splice(start + 1, 0, ...rows);
  setCellData(cellData);

  // @ts-ignore
  insertRowBottomOrColumnRight(type, start, {
    number: rows.length,
    silent,
  });
}

/**
 * 删除指定行
 * @param type
 * @param startIndex
 * @param endIndex
 */
export function deleteRowOrColumnCellSync(
  type: "row" | "column",
  startIndex: number,
  endIndex: number
) {
  //  更新下 cellData
  const cellData = getCellData();
  const linesCount = endIndex - startIndex + 1;
  cellData.splice(startIndex, linesCount);
  setCellData(cellData);

  deleteRowOrColumn(type, startIndex, endIndex);
}
