import { createColumnCellRendererParamsViaMouseDetail } from "../helper";
import {
  detectIsInFrozenByFrozenPosition,
  getFrozenAreaThatCellIn,
} from "../../../customCell/helper/tools";
import luckysheetConfigsetting from "../../luckysheetConfigsetting";
import {
  getNote,
  getNoteSize,
  isCellHasNote,
  updateCellNote,
  updateCellNoteSize,
} from "./utils";

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
      let isHasNote = isCellHasNote(rowIndex, colIndex);
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
  el.classList.add(className);
  el.dataset.row = rowIndex;
  el.dataset.col = colIndex;

  const $el = $(el);
  let note = getNote(rowIndex, colIndex);
  let [width, height] = getNoteSize(rowIndex, colIndex);
  let textarea = document.createElement("textarea");
  textarea.className = "note-wrapper";
  textarea.value = note;
  textarea.style.width = `${width}px`;
  textarea.style.height = `${height}px`;

  //  监听 resize 事件
  textarea.addEventListener("mouseup", () => {
    if (textarea.clientWidth != width || textarea.clientHeight != height) {
      updateCellNoteSize(rowIndex, colIndex, [
        textarea.clientWidth,
        textarea.clientHeight,
      ]);
    }
    width = textarea.clientWidth;
    height = textarea.clientHeight;
  });

  //  监听 change 事件
  textarea.addEventListener("change", () => {
    updateCellNote(rowIndex, colIndex, textarea.value);
  });

  $el.append(textarea);

  let left = params.positionX + cellWidth;
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
    "z-index": 12,
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

export function removeDom(event, force = false) {
  window.clearTimeout(timerRemove);
  window.clearTimeout(timerShow);

  //  如果当前正在编辑状态，取消隐藏
  if (document.activeElement.className === "note-wrapper") {
    return;
  }

  if (force) {
    $(`.${className}`).remove();
    return;
  }

  timerRemove = setTimeout(() => {
    if (isHover(event)) {
      return;
    }

    $(`.${className}`).remove();
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
