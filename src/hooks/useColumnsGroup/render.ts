import Store from "../../store";
import { ColumnTitleRenderParams } from "../../customColumnHeader/types";
import { drawRectWithRadius } from "../../customCell/helper/drawHelper";
import { getMouseRelateColumn } from "../../controllers/handler";
import { createColumnTitleRendererParamsViaMouseDetail } from "../../controllers/hooks/helper";
import luckysheetConfigsetting from "../../controllers/luckysheetConfigsetting";
import type { ColumnsGroup, ColumnsGroupConfig } from "./types";
import {
  detectColumnState,
  findColumnGroupConfigByColumnIndex,
  showColumnGroup,
  hideColumnGroup,
} from "./helpers";

const linkLineColor = "#666";
const lineWidth = 2;
const handlerSize = 11;

/**
 * 渲染 column 的分组关系
 * 如果 index 为 start -1 && index >= 0 显示  加号/减号 按钮
 * 如果 index >= start && index < end 在顶部显示一条线
 * 如果 index === end 将线移动到中间，并显示一个折叠的效果
 * @constructor
 */
export function RenderGroupLinkLineOnColumnHeader(
  ColumnTitleRenderParams: ColumnTitleRenderParams
) {
  let columnsGroup: ColumnsGroup = Store?.config?.columnsGroup;
  if (!columnsGroup || columnsGroup.length === 0) return;

  const { colIndex, ctx, positionX, positionY, columnWidth, column } =
    ColumnTitleRenderParams;
  let columnState = detectColumnState(colIndex);
  if (!columnState) return;

  //  画一条线
  if (columnState === "group") {
    ctx.save();
    ctx.strokeStyle = linkLineColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(positionX, positionY + 1);
    ctx.lineTo(positionX + columnWidth, positionY + 1);
    ctx.stroke();
    ctx.restore();
  }

  //  如果是 end 画半条线，并且显示个向下的线
  if (columnState === "end") {
    ctx.save();
    ctx.strokeStyle = linkLineColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(positionX, positionY + 1);
    ctx.lineTo(positionX + columnWidth / 2, positionY + 1);
    ctx.lineTo(positionX + columnWidth / 2, positionY + 6);
    ctx.stroke();
    ctx.restore();
  }

  //  显示
  if (columnState === "handler-add" || columnState === "handler-reduce") {
    let bgX = positionX + columnWidth / 2;
    const bg = drawRectWithRadius(bgX, positionY, handlerSize, handlerSize, 2);

    ctx.save();
    ctx.strokeStyle = linkLineColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(bgX + 1, positionY + 1);
    ctx.lineTo(positionX + columnWidth, positionY + 1);
    if (columnState === "handler-add") {
      ctx.moveTo(positionX + columnWidth - 2, positionY + 1);
      ctx.lineTo(positionX + columnWidth - 2, positionY + 6);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = linkLineColor;
    ctx.fill(bg);

    //  画 加号 / 减号
    if (columnState === "handler-add") {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bgX + 2, positionY + Math.floor(handlerSize / 2));
      ctx.lineTo(
        bgX + handlerSize - 2,
        positionY + Math.floor(handlerSize / 2)
      );
      ctx.closePath();
      ctx.stroke();

      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bgX + Math.floor(handlerSize / 2), positionY + 2);
      ctx.lineTo(
        bgX + Math.floor(handlerSize / 2),
        positionY + handlerSize - 2
      );
      ctx.closePath();
      ctx.stroke();
    }

    if (columnState === "handler-reduce") {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bgX + 2, positionY + handlerSize / 2);
      ctx.lineTo(bgX + handlerSize - 2, positionY + handlerSize / 2);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.restore();

    //  将 handler 的 path 2d 存入到 column 中，用于后续鼠标移入与点击判断
    column.columnGroupHandler = bg;
  }
}

/**
 * 处理 column handler 上的 handler 点击事件
 * @constructor
 */
export function ColumnGroupHandlerClickHandler(event) {
  const mouseDetail = getMouseRelateColumn(event);
  if (!mouseDetail) return;
  const { col_index: colIndex } = mouseDetail;

  let columnState = detectColumnState(colIndex);
  if (!columnState) return;
  if (columnState !== "handler-add" && columnState !== "handler-reduce") return;

  const currentSheet = Store.luckysheetfile.find(
    (sheet) => sheet.index === Store.currentSheetIndex
  );
  const { column } = currentSheet;
  let handlerColumn = column[colIndex];

  //  获取 handler
  //  handler 在 RenderGroupLinkLineOnColumnHeader 方法渲染时就自动保存在 column 上面了
  let handler = handlerColumn.columnGroupHandler;
  if (!handler) return;

  //  获取下处理过后的 mouseDetail
  const [_, params] =
    createColumnTitleRendererParamsViaMouseDetail(mouseDetail);
  const { ctx, mouseEvent } = params;

  const isClickOnHandler = ctx.isPointInPath(
    handler,
    // mouseEvent.mouse_x + luckysheetConfigsetting.rowHeaderWidth,
    mouseEvent.mouse_x,
    mouseEvent.mouse_y - luckysheetConfigsetting.defaultRowHeight
    // mouseEvent.mouse_y
  );

  if (isClickOnHandler) {
    let config = findColumnGroupConfigByColumnIndex(colIndex);
    if (config) {
      config.hide ? showColumnGroup(colIndex) : hideColumnGroup(colIndex);
    }
  }
}

/**
 * 表格初始化时，根据 columnsGroup 来设置 colhidden
 */
export function columnsGroupSettingRestore() {
  Store.config.colhidden = Store.config.colhidden ?? {};

  let columnsGroup: ColumnsGroup = Store?.config?.columnsGroup;
  if (!columnsGroup || columnsGroup.length === 0) return;

  for (let i = 0; i < columnsGroup.length; i++) {
    let config = columnsGroup[i];
    if (!config.hide) continue;
    for (let j = config.start; j <= config.end; j++) {
      Store.config.colhidden[j] = 0;
    }
  }
}
