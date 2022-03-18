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
  isRowEditable,
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
      const { rowIndex, colIndex } = params;
      const rowId = getRowIdByRowIndex(rowIndex);
      const columnId = getColumnByColIndex(colIndex).id;
      if ($existDom.length > 0) {
        const row = $existDom.data("row-id");
        const col = $existDom.data("col-id");

        //  如果存在的话, 返回
        if (row === rowId && col === colIndex) {
          return;
        } else {
          if (isHover(event)) {
            return;
          }
          //  否则删除
          removeDom(event, true);
        }
      }

      //   判断是否有 note
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
  const isEditable = isRowEditable(rowIndex, true);

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

  //  判断当前行是否有编辑权限
  if (!isEditable) {
    textarea.setAttribute("readonly", "1");
  }

  //  不知道为什么鼠标在 textarea 按下 tab 会导致 window.scrollLeft 的改变
  textarea.addEventListener("keydown", (ev) => {
    if (ev.key === "Tab") {
      ev.preventDefault();
      return false;
    }
  });

  //  监听 resize 事件
  isEditable &&
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
  isEditable &&
    textarea.addEventListener("change", () => {
      updateCellNoteId(rowId, colId, textarea.value);
    });

  isEditable &&
    textarea.addEventListener("input", () => {
      Store.$emit("CellNoteInput", {
        textarea,
        rowId,
        colId,
        parent: el,
      });
      detectOverflow();
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

  // prettier-ignore
  $el.append(`<div class="overflow-alert">最多允许保存 ${ Store.maxNoteLength } 个字</div>`)
  detectOverflow();

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

  //  检测文本是否超过 maxNoteLength
  function detectOverflow() {
    const maxLength = Store.maxNoteLength + Store.maxNoteLengthOffset;
    const currentLength = textarea.value.length;

    if (currentLength > maxLength) {
      $el.addClass("maxlength-overflow");
    } else {
      $el.removeClass("maxlength-overflow");
    }
  }
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
  if (
    ["note-wrapper", "rich-spreadsheet-cell-extract-dom"].includes(
      document.activeElement.className
    )
  ) {
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
export function isHover(event, classNameStr = className) {
  let el = document.elementFromPoint(event.pageX, event.pageY);
  if (el?.closest(`.${classNameStr}`) || el?.classList.contains(classNameStr)) {
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
