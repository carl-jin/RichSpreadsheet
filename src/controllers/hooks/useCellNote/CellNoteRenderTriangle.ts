import type { CellRenderersParams } from "../../../customCell/types";
import { detectIsPassDataVerificationByIndex } from "../useDataVerification";
import Store from "../../../store";
import { getRowIdByRowIndex } from "../../../global/apiHelper";
import { isCellHasNote } from "./utils";

export function CellNoteRenderTriangle(
  CellRenderersParams: CellRenderersParams
) {
  const { rowIndex, colIndex, positionX, positionY, ctx, cellWidth } =
    CellRenderersParams;

  if (isCellHasNote(rowIndex, colIndex)) {
    const path = new Path2D();
    const w = 6;
    const h = 6;
    const padding = 1;

    if (positionX + cellWidth >= Store.rowHeaderWidth) {
      path.moveTo(positionX + cellWidth - w - padding, positionY);
      path.lineTo(positionX + cellWidth - padding, positionY);
      path.lineTo(positionX + cellWidth - padding, positionY + h);

      ctx.fillStyle = "#000";
      ctx.fill(path);
    }
  }
}
