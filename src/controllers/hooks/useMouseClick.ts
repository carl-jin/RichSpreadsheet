import Store from "../../store";
import { getMouseRelateCell } from "../handler";
import { createColumnCellRendererParamsViaMouseDetail,devicePixelRatioHacks } from "./helper";

const reRenderCell = (mouseDetail, selectSaveDetail) => {
  const [Render, params] =
    createColumnCellRendererParamsViaMouseDetail(mouseDetail);

  if(!params) return

  //  这里需要兼容下不同设备的 devicePixelRatio 的大小， 具体请看 devicePixelRatioHacks 具体实现
  const [wrappedParams,setDevicePixelRatio,restoreDevicePixelRatio] = devicePixelRatioHacks(Object.assign(params, {
    selectSaveDetail,
  }))
  setDevicePixelRatio()
  Render["clickRender"](wrappedParams);
  restoreDevicePixelRatio()
};

const canvasMouseClick = (event) => {
  const mouseDetail = getMouseRelateCell(event);

  if (!mouseDetail || !Store.luckysheet_select_save[0]) {
    return;
  }

  reRenderCell(mouseDetail, Store.luckysheet_select_save[0]);
};

export { canvasMouseClick };
