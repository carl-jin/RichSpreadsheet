import Store from "../../store";
import { getSheetIndex } from "../../methods/get";
import { CopyDataItemFormat, GsClipboard } from "gs-clipboard";
import { coordsTo2dArray } from "./helper";
import { jfrefreshgrid } from "../../global/refresh";
import { selectHightlightShow } from "../select";
import { setcellvalue } from "../../global/setdata";
import editor from "../../global/editor";

export function useGsClipboard() {
  Store.GS = new GsClipboard(Store.GSClipboardOptions);
}

/**
 * 从 clipboard 获取数据, 更新到当前选中的单元格
 * @param shiftKey
 */
export async function pasteFromClipboard(shiftKey: boolean = false) {
  const clipboardData = await Store.GS.getDataFromClipboard();
  const startRow = Store.luckysheet_select_save[0].row[0];
  const startCol = Store.luckysheet_select_save[0].column[0];
  const currentSheet =
    Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)];
  let d = editor.deepCopyFlowData(Store.flowdata);
  let hasChange = false;

  clipboardData.clipboardType.map((row: CopyDataItemFormat[], y) => {
    row.map((item: CopyDataItemFormat, x) => {
      const row = y + startRow;
      const col = x + startCol;
      const column = currentSheet.column[col];
      const type = column.type;
      let value = item.value;

      //  如果是 readonly 直接退出
      if (column.readonly) return;

      //  找到对应的转换器
      if (item.type && Store.cellTransformer[type]) {
        const GSCHandlers = Store.GSClipboardOptions.handlers;
        let text = "";
        let html = "";
        const correspondingHandler = GSCHandlers.find(
          (_item) => _item.type === item.type
        );
        if (correspondingHandler) {
          text = correspondingHandler.toText(item.value);
          html = correspondingHandler.toHtml(item.value);
        }

        value = Store.cellTransformer[type].parseFromClipboard(
          Object.assign(item, {
            text: text,
            html: html,
          }),
          column.cellParams
        );
        value = Store.cellTransformer[type].parseValueToData(
          value,
          column.cellParams
        );
      }

      if (d[row] && d[row][col]) {
        //  粘贴后显示粘贴的影响到的选区
        if (Store.luckysheet_select_save[0]) {
          Store.luckysheet_select_save[0].row[1] = row;
          Store.luckysheet_select_save[0].column[1] = col;
        }
        setcellvalue(row, col, d, value);
        hasChange = true;
      } else {
        //  粘贴的格式范围溢出了
      }
    });
  });

  if (!hasChange) return;
  jfrefreshgrid(d, Store.luckysheet_select_save);
  selectHightlightShow();
}

/**
 * 将指定的 单元格 数据塞入到 clipboard 中
 * @param rowIndexArr
 * @param colIndexArr
 */
export function setCopyToClipboard(
  rowIndexArr: number[],
  colIndexArr: number[]
): void {
  const data = Store.flowdata;
  const currentSheet =
    Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)];

  let cellCoordsData: {
    x: number;
    y: number;
    value: any;
    type: string;
  }[] = [];

  //
  //  拼装 cellCoordsData 数据
  for (let r = 0; r < rowIndexArr.length; r++) {
    let row = rowIndexArr[r];
    //  过滤掉隐藏行
    if (
      Store.config["rowhidden"] != null &&
      Store.config["rowhidden"][row] !== null
    )
      continue;

    for (let c = 0; c < colIndexArr.length; c++) {
      let col = colIndexArr[c];
      //  过滤掉隐藏列
      if (
        Store.config["colhidden"] != null &&
        Store.config["colhidden"][col] != null
      )
        continue;

      const column = currentSheet.column[col];
      const type = column.type ?? column.field;
      let value = data[row][col].v ? data[row][col].v : "";

      if (Store.cellTransformer[type]) {
        value = Store.cellTransformer[type].formatValueFromData(
          value,
          column.cellParams
        );
      }

      cellCoordsData.push({
        x: col,
        y: row,
        value,
        type,
      });
    }
  }

  //
  //  塞入 clipboard
  Store.GS.setCopy(coordsTo2dArray(cellCoordsData));
}
