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
import { getMouseRelateCell } from "../handler";
import {
  createColumnCellRendererParamsViaMouseDetail,
  devicePixelRatioHacks,
} from "./helper";
import { useShowCellExtractDomOnMouseEnter } from "./useShowCellExtractDomOnMouseEnter";
import { DataVerificationRenderRedTriangleIfDataVerificationFailed } from "./useDataVerification";

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
  Render[eventName](wrappedParams);
  DataVerificationRenderRedTriangleIfDataVerificationFailed(wrappedParams);
  restoreDevicePixelRatio();
};

//  **** 处理 canvas mousemove 事件, 这里同时也响应了单元格的 hover 事件
let currentEnterCellMouseDetail = {
  row_index: undefined,
  col_index: undefined,
}; //  储存当前移入 cell 的信息, 鼠标离开时, 也会需要这个值去触发 mouseout
export const canvasMousemove = throttle(50, false, (event) => {
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
