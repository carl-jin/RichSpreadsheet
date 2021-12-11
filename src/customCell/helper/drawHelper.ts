import domtoimage from "dom-to-image";

/**
 * 绘制 html 代码
 * @param html
 * @param cssObj
 */
export function drawHTMLtoImg(
  html: string,
  cssObj: {
    [key: string]: any;
  }
) {
  return new Promise((res) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    div.style.cssText = Object.keys(cssObj)
      .map((key) => {
        return `${key}:${cssObj[key]}`;
      })
      .join(";");
    const box = document.createElement("section");
    box.style.cssText = `position:absolute;left:0;top:0;opacity:0`;
    box.append(div);
    document.body.append(box);
    domtoimage
      .toPng(div)
      .then((dataurl) => {
        let img = new Image();
        img.onload = () => {
          res(img);
        };

        img.src = dataurl;

        box.remove();
      })
      .catch((error) => {
        console.error("无法转化");
      });
  });
}

/**
 * 长方形
 * @param x
 * @param y
 * @param width
 * @param height
 */
export function drawRect(x, y, width, height) {
  const path = new Path2D();
  path.rect(x, y, width, height);
  return path;
}

/**
 * 三角形
 * @param x
 * @param y
 * @param width
 * @param height
 * @param position
 */
export function drawTriangle(
  x,
  y,
  width,
  height,
  position: "top" | "right" | "bottom" | "left"
) {
  const path = new Path2D();

  if (position === "top") {
    path.moveTo(x + width / 2, y);
    path.lineTo(x, y + height);
    path.lineTo(x + width, y + height);
  }

  if (position === "right") {
    path.moveTo(x, y);
    path.lineTo(x + width, y + height / 2);
    path.lineTo(x, y + height);
  }

  if (position === "bottom") {
    path.moveTo(x, y);
    path.lineTo(x + width, y);
    path.lineTo(x + width / 2, y + height);
  }

  if (position === "left") {
    path.moveTo(x, y + height / 2);
    path.lineTo(x + width, y);
    path.lineTo(x + width, y + height);
  }

  return path;
}

/**
 * 圆角四边形
 * @param x
 * @param y
 * @param width
 * @param height
 * @param radius
 */
export function drawRectWithRadius(x, y, width, height, radius) {
  const path = new Path2D();
  path.moveTo(x, y + radius);
  path.lineTo(x, y + height - radius);
  path.quadraticCurveTo(x, y + height, x + radius, y + height);
  path.lineTo(x + width - radius, y + height);
  path.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  path.lineTo(x + width, y + radius);
  path.quadraticCurveTo(x + width, y, x + width - radius, y);
  path.lineTo(x + radius, y);
  path.quadraticCurveTo(x, y, x, y + radius);

  return path;
}

/**
 * 获取文字宽高
 * @param ctx
 * @param text
 */
export function getTextDimension(ctx, text) {
  const dimension = ctx.measureText(text);
  return {
    width: dimension.width,
    height: dimension.fontBoundingBoxAscent + dimension.fontBoundingBoxDescent,
  };
}
