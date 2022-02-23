//  这个方法, 会处理 cell 的 mouseenter mousemove 和 mouseout 事件
//  实现思路
//  监听 canvas 中的 mousemove 事件
//  每次触发时候通过计算当前鼠标下对应的 cell 位置
//  通过 cell 的位置, 找到数据库中对应的 cell 数据
//  然后 通过 currentEnterCellMouseDetail 来记录判断之前有没有移入到这个 cell 过
//  如果没有, 就触发 mouseenterRender
//  如果有, 就触发 mousemoveRender
//  如果鼠标移入到其他的 cell 了, 就触发 mouseoutRender

import { throttle } from "throttle-debounce";
import Store from "../../store";
import { getMouseRelateCell, getMouseRelateColumn } from "../handler";
import {
  createColumnTitleRendererParamsViaMouseDetail,
  createColumnCellRendererParamsViaMouseDetail,
  devicePixelRatioHacks,
} from "./helper";
import { useShowCellExtractDomOnMouseEnter } from "./useShowCellExtractDomOnMouseEnter";
import { DataVerificationRenderRedTriangleIfDataVerificationFailed } from "./useDataVerification";
import { luckysheetrefreshgrid } from "../../global/refresh";

/**
 * 重新渲染一个单元格
 * 用作与鼠标移入, 移开, 或者 hover
 * @param mouseDetail
 * @param eventName
 */
const reRenderCell = (mouseDetail, eventName) => {
  const [Render, params] =
    createColumnCellRendererParamsViaMouseDetail(mouseDetail);

  if (!params) return;

  //  这里需要兼容下不同设备的 devicePixelRatio 的大小， 具体请看 devicePixelRatioHacks 具体实现
  const [wrappedParams, setDevicePixelRatio, restoreDevicePixelRatio] =
    devicePixelRatioHacks(params);
  setDevicePixelRatio();
  Render?.[eventName] && Render?.[eventName](wrappedParams);
  DataVerificationRenderRedTriangleIfDataVerificationFailed(wrappedParams);
  restoreDevicePixelRatio();
};

/**
 * 重新渲染表头
 * 用作与鼠标移入, 移开, 或者 hover
 * @param mouseDetail
 * @param eventName
 */
const reRenderColumnTitle = (mouseDetail, eventName) => {
  const [Render, params] =
    createColumnTitleRendererParamsViaMouseDetail(mouseDetail);

  if (!params) return;

  //  这里需要兼容下不同设备的 devicePixelRatio 的大小， 具体请看 devicePixelRatioHacks 具体实现
  const [wrappedParams, setDevicePixelRatio, restoreDevicePixelRatio] =
    devicePixelRatioHacks(params);
  setDevicePixelRatio();
  Render?.[eventName] && Render?.[eventName](wrappedParams);
  restoreDevicePixelRatio();

  //  鼠标移开时重新渲染下表头，因为拖拽列宽时候也会触发
  if (eventName === "mouseoutRender") {
    luckysheetrefreshgrid();
  }
};

//  **** 处理 canvas mousemove 事件, 这里同时也响应了单元格的 hover 事件
let currentEnterCellMouseDetail = {
  row_index: undefined,
  col_index: undefined,
}; //  储存当前移入 cell 的信息, 鼠标离开时, 也会需要这个值去触发 mouseout

export const canvasMousemoveOnCell = throttle(100, false, (event) => {
  const mouseDetail = getMouseRelateCell(event);
  const isHasPreCell = Object.keys(currentEnterCellMouseDetail).length > 0;

  //  处理鼠标移入单元格后
  useShowCellExtractDomOnMouseEnter(mouseDetail, event);

  if (!mouseDetail) {
    //  如果之前记录的有 cell 信息, 这里触发下 mouseout 事件
    if (isHasPreCell) {
      reRenderCell(currentEnterCellMouseDetail, "mouseoutRender");
      currentEnterCellMouseDetail = {
        row_index: undefined,
        col_index: undefined,
      };
    }

    return;
  }

  const { row_index, col_index } = mouseDetail;

  //  如果之前记录的有 cell 信息, 触发下 mouseout
  if (
    isHasPreCell &&
    (currentEnterCellMouseDetail.row_index !== mouseDetail.row_index ||
      currentEnterCellMouseDetail.col_index !== mouseDetail.col_index)
  ) {
    reRenderCell(currentEnterCellMouseDetail, "mouseoutRender");
    currentEnterCellMouseDetail = {
      row_index: undefined,
      col_index: undefined,
    };
  }

  //  这俩应该放在 mouseout 下面处理， 不然从第二行移动到第一行时不会触发 out
  //  如果鼠标在 column header 或者 row header 跳过
  //  如果单元格被 column header 或者 row header 盖住时 跳过
  //  这里也可能是个比较长的 column， 此时的 cell_offset_left 已经是小于 0 了
  //  这里兼容下
  let isLongColumn =
    mouseDetail.col - mouseDetail.col_pre <
    $("#luckysheet-cell-main").outerWidth();
  if (
    isOnColumnHeaderOrRowHeader(mouseDetail) ||
    (isUnderColumnHeaderOrRowHeader(mouseDetail) && isLongColumn)
  )
    return;

  //  mousemove 事件
  if (
    isHasPreCell &&
    currentEnterCellMouseDetail.row_index === row_index &&
    currentEnterCellMouseDetail.col_index === col_index
  ) {
    reRenderCell(mouseDetail, "mousemoveRender");
    return;
  }

  //  mouseenter 事件
  reRenderCell(mouseDetail, "mouseenterRender");
  currentEnterCellMouseDetail = Object.assign({}, mouseDetail);
});

//  **** 处理 canvas column header hover 事件
let currentEnterColumnMouseDetail = {
  col_index: undefined,
}; //  储存当前移入 column header 的信息, 鼠标离开时, 也会需要这个值去触发 mouseout

export const canvasMousemoveOnColumnHeader = throttle(100, false, (event) => {
  const mouseDetail = getMouseRelateColumn(event);
  const isHasPreCell = currentEnterColumnMouseDetail.col_index !== undefined;

  if (!mouseDetail) {
    //  如果之前记录的有 cell 信息, 这里触发下 mouseout 事件
    if (isHasPreCell) {
      reRenderColumnTitle(currentEnterColumnMouseDetail, "mouseoutRender");
      currentEnterColumnMouseDetail = {
        col_index: undefined,
      };
    }

    return;
  }

  const { col_index } = mouseDetail;

  //  如果之前记录的有 cell 信息, 触发下 mouseout
  if (
    isHasPreCell &&
    currentEnterColumnMouseDetail.col_index !== mouseDetail.col_index
  ) {
    reRenderColumnTitle(currentEnterColumnMouseDetail, "mouseoutRender");
    currentEnterColumnMouseDetail = {
      col_index: undefined,
    };
  }

  //  如果已经超过了 header 的话，返回
  if (mouseDetail.relatedMouseEvent.mouse_y > Store.columnHeaderHeight) {
    return;
  }

  //  mouseenter 事件
  if (currentEnterColumnMouseDetail.col_index !== mouseDetail.col_index) {
    reRenderColumnTitle(mouseDetail, "mouseenterRender");
    currentEnterColumnMouseDetail = Object.assign({}, mouseDetail);
  }
});

function isUnderColumnHeaderOrRowHeader(mouseDetail) {
  const { cell_offset_top, cell_offset_left } = mouseDetail;
  return cell_offset_top < 0 || cell_offset_left < 0;
}

function isOnColumnHeaderOrRowHeader(mouseDetail) {
  const { mouse_x, mouse_y } = mouseDetail.relatedMouseEvent;
  return mouse_x < 0 || mouse_y < 0;
}
