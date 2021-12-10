import {
  CellRenderers,
  CellRenderersMouseClickParams,
  FormatValueBeforeRenderParams,
  CellRenderersMouseEventParams,
  CellRenderersParams, ExtractDomConfig,
} from "../../src";
import { getTextDimension } from "./helper";

export class Hyperlink extends CellRenderers {
  private imagesCache = [];

  render(CellRenderersParams: CellRenderersParams): void {
    const { isImage } = CellRenderersParams.value;

    isImage
      ? this.renderImage(CellRenderersParams)
      : this.renderLink(CellRenderersParams);
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

  formatValueBeforeRender({ value }: FormatValueBeforeRenderParams): any {
    let formattedValue = typeof value === "string" ? JSON.parse(value) : value;
    formattedValue.url = this.getLink(formattedValue.url);
    formattedValue.isImage = this.isImage(formattedValue.url);
    formattedValue.url = this.getGoogleLink(formattedValue.url);

    return formattedValue;
  }

  showExtractDomOnMouseEnter(
    CellRenderersParams: CellRenderersParams
  ): ExtractDomConfig {
    const { value } = CellRenderersParams;
    const { title, url } = value;
    if (!title || !url) return false;
    let html = `<div style="padding: 6px 12px">
    <a href="${url}" target="_blank" ref="nofollow" style="
    font-size: 14px;
    color: #15c;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 240px;
    text-decoration: none;
    " title="${url}">${title}</a>
    </div>`;

    return $(html).get(0);
  }

  public renderImage(CellRenderersParams: CellRenderersParams) {
    const { ctx, value, positionX, positionY } = CellRenderersParams;
    const { title, url } = value;
    ctx.font = "14px -apple-system";

    const loadingText = "图片加载中...";
    const { width: textWidth, height: textHeight } = getTextDimension(
      ctx,
      loadingText
    );

    //
    //
    //  首先绘制图片加载中提示
    ctx.fillStyle = "#999";
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillText(loadingText, positionX, positionY + textHeight + 2);

    //
    //
    //  先加载图片进来
    let cache = this.imagesCache.find((item) => item.url === url);
    if (cache) {
      //  是否有缓存
      cache.loaded //  图片是否加载成功
        ? this._renderImage(cache.img, CellRenderersParams)
        : this.renderLink(CellRenderersParams);
    } else {
      let img = new Image();
      img.onload = () => {
        this.imagesCache.push({
          url: url,
          img: img,
          loaded: true,
        });

        this._renderImage(img, CellRenderersParams);
      };
      img.onerror = (e) => {
        this.imagesCache.push({
          url: url,
          img: img,
          loaded: false,
        });

        this.renderLink(CellRenderersParams);
      };

      img.src = url;
    }
  }

  private renderLink(CellRenderersParams: CellRenderersParams) {
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
    const { title, url } = value;
    const displayText = title ? title : url;

    //  清理下单元格
    this.clearCell(CellRenderersParams);

    //  设置裁剪区域
    this.startCellClip(CellRenderersParams);

    ctx.fillStyle = "#1155CF";
    ctx.font = "14px -apple-system";
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    const { width: textWidth, height: textHeight } = getTextDimension(
      ctx,
      displayText
    );
    const left = positionX + 6;
    const top = positionY + textHeight + (cellHeight - textHeight) / 2 - 4;
    ctx.fillText(displayText, left, top);

    //  画 underline
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 1;
    ctx.moveTo(left, top + 2);
    ctx.lineTo(left + textWidth, top + 2);
    ctx.stroke();
    ctx.restore();

    //  关闭裁剪区域
    this.closeCellClip(CellRenderersParams);
  }

  private _renderImage(
    img: HTMLImageElement,
    CellRenderersParams: CellRenderersParams
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
    } = CellRenderersParams;
    const { width: imageWidth, height: imageHeight } = img;
    const imageSizeRate = imageWidth / imageHeight;
    const cellSizeRate = cellWidth / cellHeight;
    let imagePaintWidth = imageWidth;
    let imagePaintHeight = imageHeight;
    let isHorizontal = false;

    //  计算图片比例找出合适的图片宽高
    if (imageSizeRate >= cellSizeRate) {
      //  宽度保持一致
      imagePaintWidth = cellWidth;
      imagePaintHeight = Math.ceil((cellWidth / imageWidth) * imageHeight);
      isHorizontal = true;
    } else {
      //  高度保持一致
      imagePaintHeight = cellHeight;
      imagePaintWidth = Math.ceil((cellHeight / imageHeight) * imageWidth);
      isHorizontal = false;
    }

    //  清理下单元格
    this.clearCell(CellRenderersParams)

    //  处理下居中定位
    const x = isHorizontal
      ? positionX
      : positionX + (cellWidth - imagePaintWidth) / 2;
    const y = isHorizontal
      ? positionY + (cellHeight - imagePaintHeight) / 2
      : positionY;

    ctx.drawImage(img, x, y, imagePaintWidth, imagePaintHeight);
  }

  private getLink(link: string) {
    if (!link) {
      return "";
    }

    const url = this.extractGoogleImageFuncLink(link);
    const reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;

    if (new RegExp(reg).test(url)) {
      return url;
    }

    return "";
  }

  private getGoogleLink(url) {
    const reg =
      /^(http:\/\/|https:\/\/)(drive)\.google\.com\/file\/d\/(.*?)\/.*?/;
    const regexp = new RegExp(reg);
    if (regexp.test(url)) {
      const res = regexp.exec(url);
      if (res) {
        return `https://lh3.google.com/u/0/d/${res[3]}=w195-h120`;
      }
    }
    return url;
  }

  private extractGoogleImageFuncLink(link: string) {
    const reg = /=IMAGE\("(.*)".*\)/;
    const match = link.match(reg);

    if (match) {
      return match[1];
    } else {
      return link;
    }
  }

  private isImage(link: string) {
    const imageSuffixRules: string[] = [
      ".png",
      ".gif",
      ".jpg",
      "drive.google.com/file/d",
    ];

    return !!imageSuffixRules.find((f) => link.includes(f));
  }
}
