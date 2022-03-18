//  鼠标移入单元格时, 显示额外的 dom 节点
//  逻辑
//  当用户鼠标在表格上移动时候, 找到对应的 单元格
//  通过单元格的 row_index 和 col_index 找到对应的 Render
//  判断 Render.showExtractDomOnMouseEnter 是否有返回 DOM
//  如果有返回的话进行显示
//  页面滚动或者点击等等事件触发时候, 删除对应 dom
//  全局搜索 removeCellExtractDom 方法

import { createColumnCellRendererParamsViaMouseDetail } from "./helper";
import {
  getCellAdaptPositionXInfo,
  isHover,
} from "./useCellNote/useShowCellNoteDom";
import luckysheetConfigsetting from "../luckysheetConfigsetting";

enum ClassName {
  NAME = "rich-spreadsheet-cell-extract-dom",
}

let timerRemove = null;
let timerShow = null;

function RenderDom(
  position: "left" | "right" | "top" | "bottom" | string,
  DOM: HTMLElement,
  params,
  parentCssObj: Record<string, string>
) {
  //  渲染 DOM
  const { rowIndex, colIndex, cellWidth } = params;

  let el = document.createElement("section");
  el.setAttribute("tabindex", "-1");
  el.classList.add(ClassName.NAME);
  el.dataset.row = rowIndex;
  el.dataset.col = colIndex;

  const $el = $(el);
  $el.append(DOM);

  let top = 0;
  let left = 0;

  //  判断不同位置
  if (position === "bottom") {
    left = params.positionX;
    top = params.positionY + params.cellHeight + 1;
  }
  if (position === "right") {
    left = params.positionX + cellWidth + 1;
    top = params.positionY;
  }

  let [positionXChangeValue, isInFrozenArea, mainScrollLeft] =
    getCellAdaptPositionXInfo(colIndex);

  if (isInFrozenArea) {
    left += luckysheetConfigsetting.rowHeaderWidth;
    top += luckysheetConfigsetting.columnHeaderHeight;
  }

  $el.css({
    position: "absolute",
    background: "#f8fdfc",
    "box-shadow":
      "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
    "border-radius": "2px",
    border: "1px solid #ccc",
    "z-index": 1002,
    "font-size": "14px",
    "user-select": "auto",
    left: 0,
    top: 0,
    opacity: 0,
    color: "#000",
    ...parentCssObj,
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
  el.focus()
}

function removeDom(event, force = false) {
  window.clearTimeout(timerRemove);
  window.clearTimeout(timerShow);

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

export function removeCellExtractDom(event = null) {
  if (event) {
    removeDom(event);
  } else {
    removeDom(null, true);
  }
}

export function useShowCellExtractDomOnMouseEnter(
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
      if (!event.target || !event.target.closest("#luckysheet")) {
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

      //  判断当前的 rich-spreadsheet-cell-extract-dom 是否存在
      const $existDom = $(`.${ClassName.NAME}`);
      if ($existDom.length > 0) {
        const row = $existDom.data("row");
        const col = $existDom.data("col");

        //  如果存在的话, 则删除之前的
        if (row === params.rowIndex && col === params.colIndex) {
          //  这里删除之前的，而不是返回，是因为 showExtractDomOnMouseEnter 方法中
          //  可能是在同一个单元格，但是要根据用户点击的位置，显示不同的内容
          $existDom.remove();
        } else {
          if (isHover(event, ClassName.NAME)) {
            return;
          }
          //  否则删除
          removeDom(event, true);
        }
      }

      let DOM = Render.showExtractDomOnMouseEnter
        ? Render.showExtractDomOnMouseEnter(params)
        : false;
      if (DOM === false) return;

      //  showExtractDomOnMouseEnter 返回的也可能是个数组
      //  这样的话，第一个值就代表着 dom 或者 dom[]， 第二个值代表着父级的额外参数
      let parentCssObj = {};
      if (Array.isArray(DOM)) {
        parentCssObj = DOM[1];
        DOM = DOM[0];
      }

      if (DOM instanceof HTMLElement) {
        //  如果返回的是 DOM 默认渲染到底部
        RenderDom("bottom", DOM, params, parentCssObj);
      } else {
        //  如果返回的是多个 DOM
        Object.keys(DOM).map((key) => {
          RenderDom(key, DOM[key], params, parentCssObj);
        });
      }
    },
    immediately ? 0 : 400
  );
}
