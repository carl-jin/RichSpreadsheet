import type { CellRenderersParams } from "../../../customCell/types";
import Store from "../../../store";
import {
  getColumnByColIndex,
  getRowIdByRowIndex,
} from "../../../global/apiHelper";
import { isCellHasNoteById } from "./utils";

export function CellNoteRenderTriangle(
  CellRenderersParams: CellRenderersParams
) {
  const { rowIndex, colIndex, positionX, positionY, ctx, cellWidth } =
    CellRenderersParams;

  const rowId = getRowIdByRowIndex(rowIndex);
  const columnId = getColumnByColIndex(colIndex).id;
  if (isCellHasNoteById(rowId, columnId)) {
    const path = new Path2D();
    const w = 8;
    const h = 8;
    const padding = 1;

    if (positionX + cellWidth >= Store.rowHeaderWidth) {
      path.moveTo(positionX + cellWidth - w - padding, positionY);
      path.lineTo(positionX + cellWidth - padding, positionY);
      path.lineTo(positionX + cellWidth - padding, positionY + h);
      path.closePath()

      ctx.strokeStyle = '#fff';
      ctx.fillStyle = "#000";
      ctx.fill(path);
      ctx.stroke(path)
    }
  }
}
