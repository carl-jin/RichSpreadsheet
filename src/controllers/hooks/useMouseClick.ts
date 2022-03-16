//  鼠标点击,双击时重新绘制单元格
import Store from "../../store";
import { getMouseRelateCell } from "../handler";
import {
  createColumnCellRendererParamsViaMouseDetail,
  devicePixelRatioHacks,
} from "./helper";
import { DataVerificationRenderRedTriangleIfDataVerificationFailed } from "./useDataVerification";
import { useShowCellExtractDomOnMouseEnter } from "./useShowCellExtractDomOnMouseEnter";
import { CellNoteRenderTriangle } from "./useCellNote/CellNoteRenderTriangle";
import { useShowCellNoteDomOnMouseEnter } from "./useCellNote/useShowCellNoteDom";

const reRenderCell = (
  mouseDetail,
  selectSaveDetail,
  type: "clickRender" | "dbClickRender"
) => {
  const [Render, params] =
    createColumnCellRendererParamsViaMouseDetail(mouseDetail);

  if (!params) return;

  //  这里需要兼容下不同设备的 devicePixelRatio 的大小， 具体请看 devicePixelRatioHacks 具体实现
  const [wrappedParams, setDevicePixelRatio, restoreDevicePixelRatio] =
    devicePixelRatioHacks(
      Object.assign(params, {
        selectSaveDetail,
      })
    );
  setDevicePixelRatio();
  Render[type] && Render[type](wrappedParams);
  DataVerificationRenderRedTriangleIfDataVerificationFailed(wrappedParams);
  CellNoteRenderTriangle(wrappedParams);
  restoreDevicePixelRatio();
};

const canvasMouseClick = (event, skipReRenderCell: boolean = false) => {
  const mouseDetail = getMouseRelateCell(event);

  if (!mouseDetail || !Store.luckysheet_select_save[0]) {
    return;
  }

  //  处理鼠标移入单元格后
  useShowCellExtractDomOnMouseEnter(mouseDetail, event, true);
  useShowCellNoteDomOnMouseEnter(mouseDetail, event, true);
  !skipReRenderCell &&
    reRenderCell(mouseDetail, Store.luckysheet_select_save[0], "clickRender");
};

const canvasMouseDbClick = (event) => {
  const mouseDetail = getMouseRelateCell(event);

  if (!mouseDetail || !Store.luckysheet_select_save[0]) {
    return;
  }

  reRenderCell(mouseDetail, Store.luckysheet_select_save[0], "dbClickRender");
};

export { canvasMouseClick, canvasMouseDbClick };
