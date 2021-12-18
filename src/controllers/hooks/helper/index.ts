import Store from "../../../store";
import { getSheetIndex } from "../../../methods/get";
import luckysheetConfigsetting from "../../luckysheetConfigsetting";
import { column } from "../../../customCell/types";

export function deepClone(data){
  return JSON.parse(JSON.stringify(data))
}

/**
 * 从 Store.luckysheet_select_save.column 获取当前的所有 columns
 */
export function getColumnsFromSelectedSave(): column[] {
  if (Store.luckysheet_select_save.length === 0) return [];
  const currentSheet =
    Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)];
  let columns = [];
  Store.luckysheet_select_save.map((selection) => {
    const { column: columnsSelection } = selection;
    const [start, end] = columnsSelection;

    for (let i = start; i <= end; i++) {
      currentSheet.column[i] && columns.push(currentSheet.column[i]);
    }
  });

  return columns;
}

/**
 * 从 Store.luckysheet_select_save.row 获取当前的所有 row
 */
export function getRowsFromSelectedSave(): column[] {
  if (Store.luckysheet_select_save.length === 0) return [];
  let rows = [];
  Store.luckysheet_select_save.map((selection) => {
    const { row: rowsSelection } = selection;
    const [start, end] = rowsSelection;

    for (let i = start; i <= end; i++) {
      Store.flowdata[i] && rows.push(Store.flowdata[i]);
    }
  });

  return rows;
}

/**
 * 统一生成处理 render 事件的参数
 * @param mouseDetail
 */
export function createColumnCellRendererParamsViaMouseDetail(mouseDetail) {
  const {
    row_location,
    row,
    row_pre,
    row_index,
    col_location,
    col,
    col_pre,
    col_index,
    mouseEvent,
  } = mouseDetail;

  const currentSheet =
    Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)];
  const column = currentSheet.column[col_index];
  if (!column) return [false, false];
  const type = column.type;
  const Render = Store.cellRenderers[type];
  const cell = currentSheet.data[row_index][col_index];

  if (type && Render && cell) {
    const cellWidth = col - col_pre;
    const cellHeight = row - row_pre;
    const scrollLeft = $("#luckysheet-scrollbar-x").scrollLeft();
    const scrollTop = $("#luckysheet-scrollbar-y").scrollTop();

    return [
      Render,
      {
        mouseEvent,
        rowIndex: row_index,
        colIndex: col_index,
        column: column,
        columns: currentSheet.column,
        cell,
        value: Render.formatValueBeforeRender({
          value: cell.v,
          cellParams: column.cellParams,
        }),
        cellWidth: cellWidth - 2,
        cellHeight: cellHeight - 1,
        spaceX: Store.cellSpace[1],
        spaceY: Store.cellSpace[0],
        ctx: document.getElementById("luckysheetTableContent").getContext("2d"),
        positionX:
          col - scrollLeft - cellWidth + luckysheetConfigsetting.rowHeaderWidth,
        positionY:
          row -
          scrollTop -
          cellHeight +
          luckysheetConfigsetting.defaultRowHeight,
      },
    ];
  } else {
    return [false, false];
  }
}

/**
 * 苹果笔记本 （2倍屏幕，而不是普通的一倍屏幕）会使用 x 2 倍的 canvas 大小
 * 这样能保证 canvas 显示更加清晰
 * 因此需要对应的缩放逻辑
 */
export function devicePixelRatioHacks(params) {
  const rete = Store.devicePixelRatio;
  const { ctx, positionX, positionY, cellHeight, cellWidth, mouseEvent } =
    params;
  const { mouse_x, mouse_y } = mouseEvent;
  params = Object.assign({}, params, {
    cellWidth: cellWidth,
    cellHeight: cellHeight,
    positionX: positionX,
    positionY: positionY,
    mouseEvent: {
      mouse_x: mouse_x * rete, //  这里目前只需要兼容鼠标位置
      mouse_y: mouse_y * rete,
    },
  });

  const setDevicePixelRatio = () => {
    ctx.save();
    ctx.scale(Store.devicePixelRatio, Store.devicePixelRatio);
    ctx.beginPath();
    ctx.rect(positionX, positionY, cellWidth, cellHeight);
    ctx.clip();
  };

  const restoreDevicePixelRatio = () => {
    ctx.closePath();
    ctx.restore();
    ctx.save();
    ctx.restore();
  };

  return [params, setDevicePixelRatio, restoreDevicePixelRatio];
}

/**
 * transform coords to two dimensional array
 * @param coords
 */
export function coordsTo2dArray<T>(
  coords: Array<{ x: number; y: number } & T>
): (T & any)[][] {
  const maxPosition = coords.reduce(
    (reduceData, { x, y }) => {
      reduceData.max_x = Math.max(reduceData.max_x, x);
      reduceData.min_x = Math.min(reduceData.min_x, x);
      reduceData.max_y = Math.max(reduceData.max_y, y);
      reduceData.min_y = Math.min(reduceData.min_y, y);
      return reduceData;
    },
    { max_x: 0, max_y: 0, min_x: 99999, min_y: 99999 }
  );

  const _x = maxPosition.max_x - maxPosition.min_x;
  const _y = maxPosition.max_y - maxPosition.min_y;

  const output = new Array(_y + 1).fill("").map((empty, y) => {
    return new Array(_x + 1).fill("").map((_empty, x) => {
      const current_x = x + maxPosition.min_x;
      const current_y = y + maxPosition.min_y;
      const target = coords.find((item) => {
        return item.x === current_x && item.y === current_y ? item : false;
      });

      return target ?? { x: current_x, y: current_y };
    });
  });

  return output;
}
