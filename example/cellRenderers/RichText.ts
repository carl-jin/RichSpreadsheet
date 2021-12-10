import {
  CellRenderers,
  CellRenderersMouseClickParams,
  FormatValueBeforeRenderParams,
  CellRenderersMouseEventParams,
  CellRenderersParams,
  ExtractDomConfig,
} from "../../src";
import { drawHTMLtoImg, getTextDimension } from "./helper";

export class RichText extends CellRenderers {
  private richTextCache = [];

  render(CellRenderersParams: CellRenderersParams): void {
    const { value, cellHeight, cellWidth, ctx, positionX, positionY, spaceX } =
      CellRenderersParams;

    //  清理下单元格
    this.clearCell(CellRenderersParams);

    //  判断是否有缓存
    let cache = this.richTextCache.find((item) => {
      return item.content === value + `${cellWidth}_`;
    });
    if (cache) {
      this.renderRichText(cache.img, CellRenderersParams);
    } else {
      const loadingText = `努力绘制中`;
      ctx.fillStyle = "#999";
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
      const { width: textWidth, height: textHeight } = getTextDimension(
        ctx,
        loadingText
      );
      ctx.fillText(loadingText, positionX, positionY + textHeight + 2);

      drawHTMLtoImg(value, {
        width: `${cellWidth - spaceX * 2}px`,
        "font-size": "14px",
      }).then((img: HTMLImageElement) => {
        this.richTextCache.push({
          content: value + `${cellWidth}_`,
          img: img,
        });
        this.renderRichText(img, CellRenderersParams);
      });
    }
  }

  private renderRichText(
    img: HTMLImageElement,
    CellRenderersParams: CellRenderersParams
  ) {
    const { ctx, positionX, positionY, spaceX } = CellRenderersParams;
    const { width: imageWidth, height: imageHeight } = img;
    this.clearCell(CellRenderersParams);

    this.startCellClip(CellRenderersParams);
    ctx.drawImage(img, positionX + spaceX, positionY, imageWidth, imageHeight);
    this.closeCellClip(CellRenderersParams);
  }

  formatValueBeforeRender(
    FormatValueBeforeRenderParams: FormatValueBeforeRenderParams
  ): any {
    return FormatValueBeforeRenderParams.value;
  }

  clickRender(
    CellRenderersMouseClickParams: CellRenderersMouseClickParams
  ): void {}

  mouseenterRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void {}

  mousemoveRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void {}

  mouseoutRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void {}

  showExtractDomOnMouseEnter(
    CellRenderersParams: CellRenderersParams
  ): ExtractDomConfig {
    const { value } = CellRenderersParams;

    return {
      bottom: this.getATagsExtractDom(value),
      right: this.getFullContentExtractDom(value),
    };
  }

  private getFullContentExtractDom(value: string): HTMLElement {
    const div = document.createElement("div");
    div.style.cssText = `
      padding: 6px 6px;
      max-width: 340px;
      min-width: 120px;
      min-height: 80px;
      max-height: 180px;
      white-space: normal;
      overflow: auto;
      overflow-x: hidden;
    `;

    div.innerHTML = value;

    $(div).find("p").css({
      "padding-bottom": "12px",
    });

    return div;
  }

  private getATagsExtractDom(value: string): false | HTMLElement {
    let html = `<div style="padding: 6px 12px">`;

    const div = document.createElement("div");
    div.innerHTML = value;

    const aArr = Array.from(div.querySelectorAll("a"));

    aArr.map((aTag) => {
      html += `<a
        href="${aTag.href}"
        target="_blank"
        ref="nofollow"
        style="
      font-size: 14px;
      color: #15c;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 240px;
      text-decoration: none;
      "
        title="${aTag.href}"
      >
        ${aTag.innerHTML}
      </a>`;
    });

    html += "</div>";

    return aArr.length > 0 ? $(html).get(0) : false;
  }
}
