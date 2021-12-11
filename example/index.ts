import RichSpread from "../src";
import { cols, rows } from "./data";
import cellRenderers from "./cellRenderers/index";
import cellEditors from "./cellEditors";

function create() {
  RichSpread.create({
    cellRenderers,
    cellEditors,
    container: "luckysheet",
    lang: "zh",
    forceCalculation: false,
    fontList: [],
    columnHeaderHeight: 30,
    defaultColWidth: 120, //  col 宽度
    defaultRowHeight: 30, //  cell 高度
    rowHeaderWidth: 40, //  左侧序号宽度
    showtoolbar: false,
    showinfobar: false,
    showsheetbar: false,
    showstatisticBar: false,
    onReadonlyCellTryToEdit() {
      console.log("该字段无法编辑");
    },
    onCellUpdate(){
      console.log('cellUpdate')
    },
    data: [
      {
        name: "Cell",
        index: "0",
        zoomRatio: 1,
        order: "0",
        column: cols,
        row: rows.length + 2,
        celldata: rows,
        dataVerification:{
          "4_1": {
            "type": "number",
            "type2": "bw",
            "value1": "1",
            "value2": "10",
            "checked": false,
            "remote": false,
            "prohibitInput": true,
            "hintShow": false,
            "hintText": ""
          },
        }
      },
    ],
  });
}

create();
