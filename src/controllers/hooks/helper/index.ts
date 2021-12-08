import Store from "../../../store";
import { getSheetIndex } from "../../../methods/get";
import luckysheetConfigsetting from "../../luckysheetConfigsetting";

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
