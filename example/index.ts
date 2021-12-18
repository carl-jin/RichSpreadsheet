import RichSpread from "../src";
import { cols, rows } from "./data";
import cellRenderers from "./cellRenderers/index";
import cellEditors from "./cellEditors";
import GsClipboardHandler from "./GSClipboard/handler/index";

const { frozenColumnRange, cancelFrozen, insertRowOrColumn } = RichSpread;

function create() {
  RichSpread.create({
    cellRenderers,
    cellEditors,
    GSClipboardOptions: {
      handlers: GsClipboardHandler,
    },
    ContextMenu(params, type) {
      //  找到最后一个 column
      const lastColumn = params.columns[params.columns.length - 1];
      const lastColumnIndex = params.currentSheet.column.indexOf(lastColumn);

      console.log(params)
      if (type === "cell") {
        return [
          {
            name: `向上插入 ${params.rows.length} 行`,
            action() {
              const lastStartRow =
                params.selection[params.selection.length - 1].row[0];
              insertRowOrColumn("row", lastStartRow, {
                number: params.rows.length,
              });
            },
          },
          {
            name: "向下插入一行",
            action() {
              console.log("向下插入一行");
            },
          },
          {
            name: "编辑当前行",
            action() {
              console.log("编辑当前行");
            },
          },
          {
            name: "复制当前行",
            action() {
              console.log("复制当前行");
            },
          },
          {
            name: "删除当前行",
            action() {
              console.log("删除当前行");
            },
          },
        ];
      }

      if (type === "column") {
        return [
          {
            name: `冻结到第${lastColumnIndex + 1}列 (${lastColumn.headerName})`,
            icon: "luckysheet-iconfont-quanjiabiankuang",
            action() {
              frozenColumnRange({
                column_focus: lastColumnIndex,
              });
            },
          },
          {
            name: "取消冻结列",
            disabled: true,
            action() {
              cancelFrozen();
            },
          },
          {
            name: "隐藏当前列",
          },
          {
            separator: true,
          },
          {
            name: "排序",
            subMenus: [
              {
                name: "A-Z",
              },
              {
                name: "Z-A",
              },
            ],
          },
        ];
      }
    },

    onReadonlyCellTryToEdit() {
      console.log("该字段无法编辑");
    },
    onCellUpdate() {
      console.log("cellUpdate");
    },

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
    data: [
      {
        name: "Cell",
        index: "0",
        zoomRatio: 1,
        order: "0",
        column: cols,
        row: rows.length + 2,
        celldata: rows,
      },
    ],
  });
}

create();
