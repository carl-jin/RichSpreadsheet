import { createColumnCellRendererParamsViaMouseDetail } from "../helper";
import {
  detectIsInFrozenByFrozenPosition,
  getFrozenAreaThatCellIn,
} from "../../../customCell/helper/tools";
import luckysheetConfigsetting from "../../luckysheetConfigsetting";
import {
  deleteCellNoteById,
  getNoteById,
  getNoteSizeById,
  isCellHasNoteById,
  updateCellNoteId,
  updateCellNoteSizeById,
} from "./utils";
import {
  getColumnByColIndex,
  getRowIdByRowIndex,
} from "../../../global/apiHelper";
import Store from "../../../store";

export const className = "rich-spreadsheet-cell-note-dom";

let timerRemove = null;
let timerShow = null;

export function useShowCellNoteDomOnMouseEnter(
  mouseDetail,
  event,
  immediately: boolean = false
) {
  window.clearTimeout(timerShow);
  if (immediately) {
    removeDom(event, true);
  }
  timerShow = setTimeout(
    () => {
      //  如果不是在表格上的 mousemove 事件,直接关闭
      if (!event.target || !event.target.closest("#luckysheet-cell-main")) {
        removeDom(event);
        return;
      }

      //  如果找不到 dom
      if (!mouseDetail) {
        removeDom(event);
        return;
      }

      const [Render, params] =
        createColumnCellRendererParamsViaMouseDetail(mouseDetail);

      if (!params) {
        removeDom(event);
        return;
      }

      //  判断当前的 rich-spreadsheet-cell-note-dom 是否存在
      const $existDom = $(`.${className}`);
      if ($existDom.length > 0) {
        const row = $existDom.data("row");
        const col = $existDom.data("col");

        //  如果存在的话, 则删除之前的
        if (row === params.rowIndex && col === params.colIndex) {
          //  这里删除之前的，而不是返回，是因为 showExtractDomOnMouseEnter 方法中
          //  可能是在同一个单元格，但是要根据用户点击的位置，显示不同的内容
          $existDom.remove();
        } else {
          if (isHover(event)) {
            return;
          }
          //  否则删除
          removeDom(event, true);
        }
      }

      //   判断是否有 note
      const { rowIndex, colIndex } = params;
      const rowId = getRowIdByRowIndex(rowIndex);
      const columnId = getColumnByColIndex(colIndex).id;
      let isHasNote = isCellHasNoteById(rowId, columnId);
      if (isHasNote === false) return;
      RenderDom(params);
    },
    immediately ? 0 : 400
  );
}

function RenderDom(params) {
  //  渲染 DOM
  const { rowIndex, colIndex, cellWidth } = params;

  let el = document.createElement("section");
  let rowId = getRowIdByRowIndex(rowIndex);
  let colId = getColumnByColIndex(colIndex).id;

  el.classList.add(className);
  el.dataset.rowId = rowId;
  el.dataset.colId = colId;

  const $el = $(el);
  let note = getNoteById(rowId, colId);
  let [width, height] = getNoteSizeById(rowId, colId);
  let textarea = document.createElement("textarea");
  textarea.className = "note-wrapper";
  textarea.value = note;
  //  + 2 是因为 border
  textarea.style.width = `${width + 2}px`;
  textarea.style.height = `${height + 2}px`;

  //  监听 resize 事件
  textarea.addEventListener("mouseup", () => {
    if (textarea.clientWidth != width || textarea.clientHeight != height) {
      updateCellNoteSizeById(rowId, colId, [
        textarea.clientWidth,
        textarea.clientHeight,
      ]);
    }
    width = textarea.clientWidth;
    height = textarea.clientHeight;
  });

  //  监听 change 事件
  textarea.addEventListener("change", () => {
    updateCellNoteId(rowId, colId, textarea.value);
  });

  $el.append(textarea);

  //  +1 让它离边框 1 像素
  let left = params.positionX + cellWidth + 1;
  let top = params.positionY;

  let [positionXChangeValue, isInFrozenArea, mainScrollLeft] =
    getCellAdaptPositionXInfo(colIndex);

  if (isInFrozenArea) {
    left += luckysheetConfigsetting.rowHeaderWidth;
    top += luckysheetConfigsetting.columnHeaderHeight;
  }

  $el.css({
    position: "absolute",
    //  如果是 position === right 时，会导致显示出的内容盖住 filldrag 的问题
    "z-index": 1003,
    // "z-index": 2,
    left: 0,
    top: 0,
    opacity: 0,
    color: "#000",
  });

  $el.appendTo($("#luckysheet"));

  //  边缘检测, 这里要放在 $el 插入 dom 后才能获取到实际的 size
  const { width: elWidth, height: elHeight } = $el
    .get(0)
    .getBoundingClientRect();
  const { width: boxWidth, height: boxHeight } = $("#luckysheet")
    .get(0)
    .getBoundingClientRect();

  //  右侧溢出
  if (left + elWidth + 20 > boxWidth) {
    // left = params.positionX - elWidth;
    left = left - (left + elWidth + 20 - boxWidth);
  }

  //  底部溢出
  if (top + elHeight + 20 > boxHeight) {
    // top = params.positionY - elHeight;
    top = top - (top + elHeight + 20 - boxHeight);
  }

  $(el).css({
    left,
    top,
  });

  $el.css("opacity", 1);
}

function _removeDom() {
  //  判断这个元素是否存在
  let $el = $(`.${className}`);
  if ($el.length > 0) {
    //  判断当前关闭的这个 note 内容是否为空，如果为空的话，代表着删除操作
    const rowId = $el.data("row-id");
    const colId = $el.data("col-id");
    let str = getNoteById(rowId, colId);

    if (str.trim().length === 0) {
      deleteCellNoteById(rowId, colId);
      Store.$emit("CellNoteDelete", {
        rowId,
        colId,
      });
    }
  }

  $el.remove();
}

export function removeDom(event, force = false) {
  window.clearTimeout(timerRemove);
  window.clearTimeout(timerShow);

  //  如果当前正在编辑状态，取消隐藏
  if (document.activeElement.className === "note-wrapper") {
    return;
  }

  if (force) {
    _removeDom();
    return;
  }

  timerRemove = setTimeout(() => {
    if (isHover(event)) {
      return;
    }

    _removeDom();
  }, 300);
}

export function removeCellNoteDom(event = null) {
  if (event) {
    removeDom(event);
  } else {
    removeDom(null, true);
  }
}

/**
 * 判断当前的 dom 是否处于 hover 状态
 */
export function isHover(event) {
  let el = document.elementFromPoint(event.pageX, event.pageY);
  if (el?.closest(`.${className}`) || el?.classList.contains(className)) {
    return true;
  }
}

/**
 * 获取指定 colindex 适配后的 positionX
 * 比如 col 在冻结区域时，positionX 需要做相应的改变
 * @return [ positionX 改变的值，是否在冻结区域，当前滚动值 ]
 */
export function getCellAdaptPositionXInfo(
  colIndex: number
): [number, boolean, number] {
  let positionXChangeValue = 0;
  const scrollLeft = $("#luckysheet-scrollbar-x").scrollLeft();
  //  判断当前渲染的单元格是否在冻结区域内
  let cellInPosition = getFrozenAreaThatCellIn(1, colIndex);
  let isInFrozenArea = detectIsInFrozenByFrozenPosition(cellInPosition);

  if (isInFrozenArea) {
    positionXChangeValue += scrollLeft;
  }

  return [positionXChangeValue, isInFrozenArea, scrollLeft];
}
