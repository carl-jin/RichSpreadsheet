import {
  insertRowOrColumn,
  insertRowBottomOrColumnRight,
  deleteRowOrColumn,
} from "./api";
import {getCellData, setCellData} from "./apiHelper";

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
 */
export function insertRowBottomOrColumnRightCellSync(
  type: "row" | "column",
  start: number,
  rows: any[]
) {
  //  更新下 cellData
  const cellData = getCellData();
  cellData.splice(start + 1, 0, ...rows);
  setCellData(cellData);

  // @ts-ignore
  insertRowBottomOrColumnRight(type, start, {
    number: rows.length,
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
  cellData.splice(startIndex, endIndex - startIndex + 1);
  setCellData(cellData);

  deleteRowOrColumn(type, startIndex, endIndex);
}

