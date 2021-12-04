import Store from "../../../store";
import { getSheetIndex } from "../../../methods/get";
import luckysheetConfigsetting from "../../luckysheetConfigsetting";

export interface RenderMethods {
  //  显示一个 dom
  showDom(
    position: "top" | "right" | "bottom" | "left",
    DOM: HTMLDivElement
  ): {
    close(): void;
  };

  //  直接进入编辑
  edit(): void;
}

//  给 render 提供一些方法
function getCanvasMethods(): RenderMethods {
  //  在 cell 周围显示一个 dom
  function showDom(position, DOM) {
    return {
      close() {},
    };
  }

  //  cell 进入编辑
  function edit() {}

  return {
    showDom,
    edit,
  };
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
  const type = currentSheet.column[col_index].type;
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
        column: currentSheet.column[col_index],
        columns: currentSheet.column,
        cell,
        value: Render.formatValueBeforeRender({
          value: cell.v,
          cellParams: currentSheet.column[col_index].cellParams,
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
        methods: getCanvasMethods(),
      },
    ];
  } else {
    return [false, false];
  }
}
