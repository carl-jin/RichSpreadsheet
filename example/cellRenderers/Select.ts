import { CellRenderers } from "../../src";
import type {
  FormatValueBeforeRenderParams,
  CellRenderersParams,
  CellRenderersMouseEventParams,
  CellRenderersMouseClickParams,
} from "../../src";
import {
  drawRect,
  drawRectWithRadius,
  drawTriangle,
  getTextDimension,
} from "./helper";

class Select extends CellRenderers {
  mouseenterRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ) {
    this.render(CellRenderersMouseEventParams);
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
    const { mouseEvent, ctx } = CellRenderersMouseClickParams;
    const { mouse_x, mouse_y } = mouseEvent;
    const { rectPath, pathTriangle } = this.render(
      CellRenderersMouseClickParams
    );

    //  如果鼠标点击 三角区域
    if (ctx.isPointInPath(rectPath, mouse_x, mouse_y)) {
      console.log("点击");
      //  todo 直接显示编辑框
    }
  }

  render({
    ctx,
    value,
    positionX,
    positionY,
    spaceX,
    spaceY,
    cellHeight,
    cellWidth,
  }: CellRenderersParams) {
    const paddingY = 4;
    const paddingX = 12;
    let offsetX = 0;

    //  三角形参数
    const tWidth = 12;
    const tHeight = 6;
    const tLeft = positionX + cellWidth - tWidth - spaceX;
    const tTop = Math.ceil(positionY + (cellHeight - tHeight) / 2) - 1;

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

    return {
      rectPath,
      pathTriangle,
    };
  }

  formatValueBeforeRender({
    value,
    cellParams,
  }: FormatValueBeforeRenderParams) {
    if (!cellParams) return [];
    if (value.length === 0) return [];

    //  判断是否是数组字符串
    try {
      let parseArr = JSON.parse(value);
      return this.transformKeyArrToTitleArr(parseArr, cellParams);
    } catch (e) {
      return [];
    }
  }

  private transformKeyArrToTitleArr(arr: string[], cellParams) {
    let selectOptions = cellParams.options.options;
    let outputArr = [];

    //  找到每个 key 对应的 title
    arr.map((key) => {
      let currentOption = selectOptions.find((option) => option.key === key);
      if (currentOption) {
        outputArr.push(currentOption);
      }
    });

    return outputArr;
  }
}

export default Select;
