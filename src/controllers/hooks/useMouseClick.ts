import Store from "../../store";
import { getMouseRelateCell } from "../handler";
import { createColumnCellRendererParamsViaMouseDetail } from "./helper";

const reRenderCell = (mouseDetail, selectSaveDetail) => {
  const [Render, params] =
    createColumnCellRendererParamsViaMouseDetail(mouseDetail);
  params &&
    Render["clickRender"](
      Object.assign(params, {
        selectSaveDetail,
      })
    );
};

const canvasMouseClick = (event) => {
  const mouseDetail = getMouseRelateCell(event);

  if (!mouseDetail || !Store.luckysheet_select_save[0]) {
    return;
  }

  reRenderCell(mouseDetail, Store.luckysheet_select_save[0]);
};

export { canvasMouseClick };
