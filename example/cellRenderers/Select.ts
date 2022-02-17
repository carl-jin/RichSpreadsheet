import { CellRenderers, ExtractDomConfig } from "../../src";
import type {
  CellRenderersParams,
  CellRenderersMouseEventParams,
  CellRenderersMouseClickParams,
} from "../../src";
import {
  drawRect,
  drawRectWithRadius,
  drawTriangle,
  getTextDimension,
} from "../../src";

class Select extends CellRenderers {
  render(CellRenderersParams: CellRenderersParams) {
    const {
      ctx,
      value,
      positionX,
      positionY,
      spaceX,
      spaceY,
      cellHeight,
      cellWidth,
    } = CellRenderersParams;
    const paddingY = 4;
    const paddingX = 12;
    let offsetX = 0;

    //  三角形参数
    const tWidth = 12;
    const tHeight = 6;
    const tLeft = positionX + cellWidth - tWidth - spaceX;
    const tTop = Math.ceil(positionY + (cellHeight - tHeight) / 2) - 1;

    //  清理下单元格
    this.clearCell(CellRenderersParams);
    //  设置裁剪区域
    this.startCellClip(CellRenderersParams);

    ctx.font = "14px -apple-system";
    value.map((item, index) => {
      const { width: textWidth, height: textHeight } = getTextDimension(
        ctx,
        item.title
      );
      const rectWidth = textWidth + paddingX * 2;
      const rectHeight = textHeight + paddingY * 2;
      const left = Math.ceil(positionX + spaceX) + offsetX;
      const top = Math.ceil(positionY + (cellHeight - rectHeight) / 2) - 1; //  垂直居中

      //  如果已经溢出, 就不渲染了
      if (left > positionX + cellWidth) return;

      //  画底色
      const path = drawRectWithRadius(left, top, rectWidth, rectHeight, 8);
      ctx.fillStyle = item.color;
      ctx.fill(path);

      //  画文字
      ctx.fillStyle = "#fff";
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
      ctx.fillText(
        item.title,
        Math.ceil(left + (rectWidth - textWidth) / 2),
        Math.ceil(top + textHeight + 2)
      );

      ctx.closePath();
      offsetX += rectWidth + 8;
    });

    //  画长方形
    const rectPath = drawRect(
      tLeft - tWidth / 2,
      tTop - tWidth + tHeight / 2,
      tWidth * 2,
      tWidth * 2
    );
    ctx.fillStyle = "#fff";
    ctx.fill(rectPath);

    //  画三角形
    const pathTriangle = drawTriangle(tLeft, tTop, tWidth, tHeight, "bottom");
    ctx.fillStyle = "#666";
    ctx.fill(pathTriangle);

    //  关闭裁剪区域
    this.closeCellClip(CellRenderersParams);

    return {
      rectPath,
      pathTriangle,
    };
  }

  mouseenterRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ) {
    const {
      ctx,
      value,
      positionX,
      positionY,
      spaceX,
      spaceY,
      cellHeight,
      cellWidth,
    } = CellRenderersMouseEventParams;

    //  清理下单元格
    this.clearCell(CellRenderersMouseEventParams);
    //  设置裁剪区域
    this.startCellClip(CellRenderersMouseEventParams);

    ctx.rect(
      positionX,
      positionY,
      cellWidth,
      cellHeight
    );
    ctx.fillStyle = "#f20"
    ctx.fill()


    //  关闭裁剪区域
    this.closeCellClip(CellRenderersMouseEventParams);
  }

  mousemoveRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ) {

    const { mouseEvent, ctx } = CellRenderersMouseEventParams;
    const { mouse_x, mouse_y } = mouseEvent;
    const { rectPath, pathTriangle } = this.render(
      CellRenderersMouseEventParams
    );

    //  如果鼠标移入到 三角区域
    if (ctx.isPointInPath(rectPath, mouse_x, mouse_y)) {
      ctx.fillStyle = "#666";
      ctx.fill(rectPath);
      ctx.fillStyle = "#fff";
      ctx.fill(pathTriangle);
    }
  }

  mouseoutRender(CellRenderersMouseEventParams: CellRenderersMouseEventParams) {
    this.render(CellRenderersMouseEventParams);
  }

  clickRender(CellRenderersMouseClickParams: CellRenderersMouseClickParams) {
    const { mouseEvent, ctx, rowIndex, colIndex } =
      CellRenderersMouseClickParams;
    const { mouse_x, mouse_y } = mouseEvent;
    const { rectPath, pathTriangle } = this.render(
      CellRenderersMouseClickParams
    );

    //  如果鼠标点击 三角区域
    if (ctx.isPointInPath(rectPath, mouse_x, mouse_y)) {
      this.startEdit(CellRenderersMouseClickParams);
    }
  }

  showExtractDomOnMouseEnter(
    CellRenderersParams: CellRenderersParams
  ): ExtractDomConfig {
    return false;
  }
}

export default Select;
