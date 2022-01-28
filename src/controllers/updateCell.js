import luckysheetFreezen from "./freezen";
import menuButton from "./menuButton";
import conditionformat from "./conditionformat";
import alternateformat from "./alternateformat";
import { getcellvalue, getInlineStringStyle } from "../global/getdata";
import { valueShowEs } from "../global/format";
import formula from "../global/formula";
import { luckysheetRangeLast } from "../global/cursorPos";
import cleargridelement from "../global/cleargridelement";
import { isInlineStringCell } from "./inlineString";
import Store from "../store";
import { getSheetIndex } from "../methods/get";
import {
  removeDataVerificationTooltip,
  useDataVerificationOnInput,
} from "./hooks/useDataVerification";
import { isRowEditable } from "../global/apiHelper";

//  editor **** editor cell 编辑
export function luckysheetupdateCell(
  row_index1,
  col_index1,
  d,
  cover,
  isnotfocus
) {
  const currentSheet =
    Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)];
  const column = currentSheet.column[col_index1];
  removeDataVerificationTooltip();

  //  readonly 状态下禁止修改
  if (column.readonly === true) {
    Store.$emit("CantEditReadonly");
    return;
  }

  if (!isRowEditable(row_index1)) {
    return;
  }

  let size = getColumnAndRowSize(row_index1, col_index1, d);
  let { row, row_pre, row_index, col, col_pre, col_index } = size;

  let winH = $(window).height();
  let winW = $(window).width();
  let container_offset = $("#" + Store.container).offset();
  let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
  let scrollTop = $("#luckysheet-cell-main").scrollTop();

  let left =
    col_pre + container_offset.left + Store.rowHeaderWidth - scrollLeft - 2;
  if (
    luckysheetFreezen.freezenverticaldata != null &&
    col_index1 <= luckysheetFreezen.freezenverticaldata[1]
  ) {
    left = col_pre + container_offset.left + Store.rowHeaderWidth - 2;
  }

  let top =
    row_pre +
    container_offset.top +
    Store.infobarHeight +
    Store.toolbarHeight +
    Store.calculatebarHeight +
    Store.columnHeaderHeight -
    scrollTop -
    2;
  if (
    luckysheetFreezen.freezenhorizontaldata != null &&
    row_index1 <= luckysheetFreezen.freezenhorizontaldata[1]
  ) {
    top =
      row_pre +
      container_offset.top +
      Store.infobarHeight +
      Store.toolbarHeight +
      Store.calculatebarHeight +
      Store.columnHeaderHeight -
      2;
  }

  let input_postition = {
    opacity: 1,
    "min-width": col - col_pre + 1 - 7,
    "min-height": row - row_pre + 1 - 3,

    "max-width": winW + scrollLeft - col_pre - 20 - Store.rowHeaderWidth,
    "max-height":
      winH +
      scrollTop -
      row_pre -
      20 -
      15 -
      Store.toolbarHeight -
      Store.infobarHeight -
      Store.calculatebarHeight -
      Store.sheetBarHeight -
      Store.statisticBarHeight,
    left: left,
    top: top,
  };

  let inputContentScale = {
    transform: "scale(" + Store.zoomRatio + ")",
    "transform-origin": "left top",
    width: 100 / Store.zoomRatio + "%",
    height: 100 / Store.zoomRatio + "%",
  };

  Store.luckysheetCellUpdate = [row_index, col_index];
  if (!isnotfocus) {
    $("#luckysheet-rich-text-editor").focus().select();
  }

  $("#luckysheet-input-box").removeAttr("style").css({
    "background-color": "rgb(255, 255, 255)",
    padding: "0px 2px",
    "font-size": "13px",
    right: "auto",
    "overflow-y": "auto",
    "box-sizing": "initial",
    display: "flex",
  });

  if (
    luckysheetFreezen.freezenverticaldata != null ||
    luckysheetFreezen.freezenhorizontaldata != null
  ) {
    $("#luckysheet-input-box").css("z-index", 10002);
  }

  $("#luckysheet-input-box-index")
    .html(`${column.headerName} _ ${row_index + 1}`)
    .hide();

  let value = "",
    isCenter = false;

  //  判断当前 cell 存不存在
  if (d[row_index] != null && d[row_index][col_index] != null) {
    let cell = d[row_index][col_index];
    let leftOrigin = "left",
      topOrigin = "top";

    inputContentScale["transform-origin"] = leftOrigin + " " + topOrigin;

    if (!cover) {
      if (isInlineStringCell(cell)) {
        value = getInlineStringStyle(row_index, col_index, d);
      } else if (cell.f != null) {
        value = getcellvalue(row_index, col_index, d, "f");
      } else {
        value = valueShowEs(row_index, col_index, d);
        if (cell.qp == "1") {
          value = value ? "" + value : value;
        }
      }
    }

    let style = $("#luckysheet-input-box").get(0).style.cssText;

    $("#luckysheet-input-box").get(0).style.cssText = style;
    if (
      $("#luckysheet-input-box").get(0).style.backgroundColor ==
      "rgba(0, 0, 0, 0)"
    ) {
      $("#luckysheet-input-box").get(0).style.background = "rgb(255,255,255)";
    }
  } else {
    //交替颜色
    let af_compute = alternateformat.getComputeMap();
    var checksAF = alternateformat.checksAF(row_index, col_index, af_compute);

    //条件格式
    var cf_compute = conditionformat.getComputeMap();
    var checksCF = conditionformat.checksCF(row_index, col_index, cf_compute);

    if (checksCF != null && checksCF["cellColor"] != null) {
      $("#luckysheet-input-box").get(0).style.background =
        checksCF["cellColor"];
    } else if (checksAF != null) {
      $("#luckysheet-input-box").get(0).style.background = checksAF[1];
    }
  }

  if (input_postition["min-height"] > input_postition["max-height"]) {
    input_postition["min-height"] = input_postition["max-height"];
  }

  if (input_postition["min-width"] > input_postition["max-width"]) {
    input_postition["min-width"] = input_postition["max-width"];
  }

  value = formula.xssDeal(value);

  //  editor ****  这里处理 cell editor 显示
  const type = currentSheet.column[col_index].type;
  const originalValue = value;
  value = Store.cellTransformer[type]
    ? Store.cellTransformer[type].formatValueFromData(
        value,
        currentSheet.column[col_index].cellParams
      )
    : value;
  if (type && Store.cellEditors[type]) {
    const Editor = Store.cellEditors[type];
    let cell = Store.flowdata[row_index][col_index];

    //  创建一个空 div
    let Dom = document.createElement("div");

    const isPopup = Editor.isPopup ? Editor.isPopup() : false;
    const customDomBox = document.createElement("div");
    customDomBox.classList.add("cell-editor-custom");
    customDomBox.appendChild(Dom);
    $("#luckysheet-input-box").css("padding", "0");
    $("#luckysheet-rich-text-editor").hide();

    if (isPopup) {
      customDomBox.classList.add("cell-editor-custom-popup");
      $("#luckysheet-input-box").after(customDomBox);
    } else {
      $("#luckysheet-rich-text-editor").after(customDomBox);
    }

    //  调用 edit 时将 Dom 传递过去，这样可以让 vue 直接 $mount
    let returnDom = Editor.edit(
      {
        rowIndex: row_index,
        colIndex: col_index,
        column: currentSheet.column[col_index],
        columns: currentSheet.column,
        cell: cell,
        value,
        originalValue,
      },
      Dom
    );

    //  如果 edit 返回的有 dom 则使用返回的 dom
    if (returnDom) {
      Dom.appendChild(returnDom);
    }

    //  内容输入时显示验证信息
    useDataVerificationOnInput(customDomBox, col_index);
    Editor.afterMounted && Editor?.afterMounted(customDomBox);
  } else {
    $("#luckysheet-rich-text-editor").html(value).show();
  }

  if (!isnotfocus) {
    luckysheetRangeLast($("#luckysheet-rich-text-editor")[0]);
  }

  const isPopup = $(".cell-editor-custom-popup").length > 0;

  $("#luckysheet-input-box").css(input_postition);
  $("#luckysheet-rich-text-editor").css(inputContentScale);

  if (isPopup) {
    $(".cell-editor-custom-popup").css({
      left: input_postition.left,
      top: input_postition.top,
      position: "absolute",
      zIndex: 888,
      border: "2px #5292f7 solid",
      backgroundColor: "#fff",
    });
    $("#luckysheet-input-box").css({
      opacity: 0,
    });
  }

  formula.rangetosheet = Store.currentSheetIndex;
  formula.createRangeHightlight();
  formula.rangeResizeTo = $("#luckysheet-rich-text-editor");
  cleargridelement();

  //  设置自定义编辑框 size
  {
    const $customBox = $(".cell-editor-custom");
    if ($customBox.length === 0) return;

    const { width: boxWidth, height: boxHeight } = $("#luckysheet-input-box")
      .get(0)
      .getBoundingClientRect();
    const { width: inputWidth, height: inputHeight } = $customBox
      .get(0)
      .getBoundingClientRect();

    if (boxWidth - inputWidth > 10) {
      $customBox.css({
        width: boxWidth,
      });
    }

    if (boxHeight - inputHeight > 10) {
      $customBox.css({
        height: boxHeight,
      });
    }
  }

  //  检测内容是否溢出
  {
    setTimeout(() => {
      //  如果 .cell-editor-custom 和 #luckysheet-rich-text-editor 同级则当前为 popup 状态
      const isPopup = $(".cell-editor-custom-popup").length > 0;
      const $container = $("#" + Store.container);
      const $target = isPopup
        ? $(".cell-editor-custom-popup")
        : $("#luckysheet-input-box");

      if ($container.length === 0 || $target.length === 0) return;

      const {
        left: BLeft,
        top: BTop,
        width: BWidth,
        height: BHeight,
      } = $container.get(0).getBoundingClientRect();
      const {
        left: ELeft,
        top: ETop,
        width: EWidth,
        height: EHeight,
      } = $target.get(0).getBoundingClientRect();

      //  判断底部是否溢出
      if (ETop - BTop + EHeight > BHeight) {
        $(isPopup ? ".cell-editor-custom-popup" : "#luckysheet-input-box").css({
          top: "auto",
          bottom: 18,
        });
      }

      //  判断右侧是否溢出
      if (ELeft - BLeft + EWidth > BWidth) {
        $(isPopup ? ".cell-editor-custom-popup" : "#luckysheet-input-box").css({
          left: "auto",
          right: 18 + $(window).outerWidth() - BWidth - BLeft,
          width: $target.outerWidth(),
        });
      }
    }, 200);
  }
}

export function setCenterInputPosition(row_index, col_index, d) {
  if (row_index == null || col_index == null) {
    return;
  }
  let cell = d[row_index][col_index];
  if (cell == null) {
    return;
  }
  let htValue = cell["ht"];
  if (cell != null && htValue != "0") {
    //0 center, 1 left, 2 right
    return;
  }

  let size = getColumnAndRowSize(row_index, col_index, d);
  let row = size.row,
    row_pre = size.row_pre,
    col = size.col,
    col_pre = size.col_pre;

  let winH = $(window).height(),
    winW = $(window).width();
  let container_offset = $("#" + Store.container).offset();
  let scrollLeft = $("#luckysheet-cell-main").scrollLeft();
  let scrollTop = $("#luckysheet-cell-main").scrollTop();

  let input_postition = {
    "min-width": col - col_pre + 1 - 8,
    "max-width": (winW * 2) / 3,
    left:
      col_pre + container_offset.left + Store.rowHeaderWidth - scrollLeft - 2,
  };

  let width = $("#luckysheet-input-box").width();
  if (width > input_postition["max-width"]) {
    width = input_postition["max-width"];
  }

  if (width < input_postition["min-width"]) {
    width = input_postition["min-width"];
  }

  let newLeft = input_postition["left"] - width / 2 + (col - col_pre) / 2;
  if (newLeft < 2) {
    newLeft = 2;
  }

  input_postition["left"] = newLeft - 2;

  $("#luckysheet-input-box").css(input_postition);
}

export function getColumnAndRowSize(row_index, col_index, d) {
  let row = Store.visibledatarow[row_index],
    row_pre = row_index - 1 == -1 ? 0 : Store.visibledatarow[row_index - 1];
  let col = Store.visibledatacolumn[col_index],
    col_pre = col_index - 1 == -1 ? 0 : Store.visibledatacolumn[col_index - 1];

  if (d == null) {
    d = Store.flowdata;
  }

  let margeset = menuButton.mergeborer(d, row_index, col_index);
  if (!!margeset) {
    row = margeset.row[1];
    row_pre = margeset.row[0];
    row_index = margeset.row[2];
    col = margeset.column[1];
    col_pre = margeset.column[0];
    col_index = margeset.column[2];
  }

  return {
    row: row,
    row_pre: row_pre,
    row_index: row_index,
    col: col,
    col_pre: col_pre,
    col_index: col_index,
  };
}
