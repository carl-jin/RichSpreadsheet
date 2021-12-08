import { createColumnCellRendererParamsViaMouseDetail } from "./helper";
import Store from "../../store";

enum ClassName {
  NAME = "rich-spreadsheet-cell-extract-dom",
}

let timerRemove = null;
let timerShow = null;

/**
 * 判断当前的 dom 是否处于 hover 状态
 */
function isHover(event) {
  let el = document.elementFromPoint(event.pageX, event.pageY);
  if (
    (el && el.closest(`.${ClassName.NAME}`)) ||
    el.classList.contains(ClassName.NAME)
  ) {
    return true;
  }
}

function removeDom(event, force = false) {
  window.clearTimeout(timerRemove);

  if (force) {
    $(`.${ClassName.NAME}`).remove();
    return;
  }

  timerRemove = setTimeout(() => {
    if (isHover(event)) {
      return;
    }

    $(`.${ClassName.NAME}`).remove();
  }, 300);
}

export function useShowCellExtractDomOnMouseEnter(mouseDetail, event) {
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

  window.clearTimeout(timerShow);
  timerShow = setTimeout(() => {
    //  判断当前的 rich-spreadsheet-cell-extract-dom 是否存在
    const $existDom = $(`.${ClassName.NAME}`);
    if ($existDom.length > 0) {
      const row = $existDom.data("row");
      const col = $existDom.data("col");

      //  如果存在的话, 并且已经显示为当前 cell 了就什么不干
      if (row === params.rowIndex && col === params.colIndex) {
        return;
      } else {
        if (isHover(event)) {
          return;
        }
        //  否则删除
        removeDom(event, true);
      }
    }

    const DOM = Render.showExtractDomOnMouseEnter(params);
    if (!DOM) return;

    //  渲染 DOM
    const $main = $("#luckysheet-cell-main");
    const { rowIndex, colIndex } = params;

    let el = document.createElement("section");
    let scrollLeft = $main.scrollLeft();
    let scrollTop = $main.scrollTop();
    el.classList.add(ClassName.NAME);
    el.dataset.row = rowIndex;
    el.dataset.col = colIndex;

    const $el = $(el);
    $el.append(DOM);

    $el.css({
      position: "absolute",
      background: "#fff",
      padding: "8px 4px",
      "box-shadow": "0 1px 3px 1px rgba(60, 64 ,67 ,.4)",
      "border-radius": "8px",
      "z-index": 999,
      "font-size": "14px",
      left: params.positionX - Store.rowHeaderWidth + scrollLeft,
      top:
        params.positionY -
        Store.columnHeaderHeight +
        params.cellHeight +
        scrollTop,
      opacity: 0,
    });

    $el.appendTo($main);
    $el.animate({ opacity: 1 }, { duration: 200 });
  }, 400);
}
