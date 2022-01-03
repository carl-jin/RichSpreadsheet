import {
  RichSpread,
  insertRowOrColumnCellSync,
  insertRowBottomOrColumnRightCellSync,
  deleteRowOrColumnCellSync,
  getCurrentSheet,
  setFrozen,
  cancelFrozenHacks,
  getSelectedRowIds,
  showLoading,
  hideLoading,
} from "../src";
import { cols, rows } from "./data";
import cellRenderers from "./cellRenderers/index";
import cellEditors from "./cellEditors";
import cellTransformer from "./cellTransfomer";
import GsClipboardHandler from "./GSClipboard/handler/index";
import { deepClone } from "../src/controllers/hooks/helper";

const { cancelFrozen, setBothFrozen } = RichSpread;

function create() {
  RichSpread.create({
    cellRenderers,
    cellEditors,
    cellTransformer,
    GSClipboardOptions: {
      handlers: GsClipboardHandler,
    },
    ContextMenu(params, type) {
      //  找到最后一个 column
      const lastColumnIndex =
        params.selection[params.selection.length - 1].column[1];
      const lastRowIndex = params.selection[params.selection.length - 1].row[1];

      console.log(params);

      if (type === "cell") {
        return [
          {
            name: "复制",
            action() {},
          },
          {
            name: "编辑",
            action() {},
          },
        ];
      }

      if (type === "row") {
        return [
          {
            name: `向上插入 ${params.rows.length} 行`,
            action() {
              const lastStartRow =
                params.selection[params.selection.length - 1].row[0];

              let newArr = [];
              params.rows.map((row, index) => {
                newArr.push({
                  id: Math.ceil(Math.random() * 999999),
                });
              });

              insertRowOrColumnCellSync("row", lastStartRow, newArr);
            },
          },
          {
            name: `向下插入 ${params.rows.length} 行`,
            action() {
              const lastStartRow =
                params.selection[params.selection.length - 1].row[1];

              let newArr = [];
              params.rows.map((row, index) => {
                newArr.push({
                  id: Math.ceil(Math.random() * 999999),
                });
              });

              insertRowBottomOrColumnRightCellSync("row", lastStartRow, newArr);
            },
          },
          {
            separator: true,
          },
          {
            name: "编辑当前行",
            action() {},
          },
          {
            name: "复制当前行",
            action() {
              const lastStartRow =
                params.selection[params.selection.length - 1].row[1];

              let newArr = [];
              params.rows.map((row, index) => {
                const newItem = deepClone(row);
                newItem.id = Math.ceil(Math.random() * 9999);
                newArr.push(newItem);
              });

              insertRowBottomOrColumnRightCellSync("row", lastStartRow, newArr);
            },
          },
          {
            name: `删除所选的 ${params.rows.length} 行`,
            action() {
              const [startIndex, endIndex] =
                params.selection[params.selection.length - 1].row;
              deleteRowOrColumnCellSync("row", startIndex, endIndex);
              console.log("删除当前行");
            },
          },
          {
            separator: true,
          },
          {
            name: `冻结到第${lastRowIndex + 1}行`,
            action() {
              setFrozen({
                row: lastRowIndex,
              });
            },
          },
          {
            name: "取消行冻结",
            disabled: true,
            action() {
              cancelFrozenHacks("row");
            },
          },
        ];
      }

      if (type === "column") {
        return [
          {
            name: `冻结到第${lastColumnIndex + 1}列 (${
              params.currentSheet.column[lastColumnIndex].headerName
            })`,
            icon: "luckysheet-iconfont-quanjiabiankuang",
            action() {
              setFrozen({
                col: lastColumnIndex,
              });
            },
          },
          {
            name: "取消列冻结",
            disabled: true,
            action() {
              cancelFrozenHacks("column");
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
        config: {
          columnlen: {
            0: 320,
          },
        },
      },
    ],
  });
}

create();

let unsub = RichSpread.$on("FrozenChanged", (args) => {
  console.log(args);
});

//  获取 rows id
document.querySelector("#rowIds").addEventListener("click", () => {
  console.log(getSelectedRowIds());

  showLoading();
  setTimeout(() => {
    hideLoading();
  }, 2000);
});
