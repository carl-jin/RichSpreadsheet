import RichSpread from "../src";
import { cols, rows } from "./data";
import cellRenderers from "./cellRenderers/index";
import cellEditors from './cellEditors'

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
    onReadonlyCellTryToEdit(){
      console.log('该字段无法编辑')
    },
    data: [
      {
        name: "Cell",
        config: {
          merge: {},
          borderInfo: [],
          rowlen: {},
          columnlen: {},
          rowhidden: {},
          customHeight: {},
          customWidth: {},
        },
        index: "0",
        zoomRatio: 1,
        order: "0",
        column: cols,
        row: rows.length + 2,
        status: 1,
        celldata: rows,
        // ch_width: 2361,
        // rh_height: 936,
        luckysheet_select_save: [
          {
            left: 741,
            width: 138,
            top: 796,
            height: 19,
            left_move: 741,
            width_move: 138,
            top_move: 796,
            height_move: 19,
            row: [33, 33],
            column: [6, 6],
            row_focus: 33,
            column_focus: 6,
          },
        ],
        calcChain: [
          {
            r: 0,
            c: 3,
            index: "0",
            func: [true, 3, "=Formula!A1+Formula!B1"],
            color: "w",
            parent: null,
            chidren: {},
            times: 0,
          },
        ],
        scrollLeft: 0,
        scrollTop: 0,
      },
    ],
  });
}

create();
