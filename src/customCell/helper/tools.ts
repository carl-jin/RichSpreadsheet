/**
 * 将 DOMMatrix 转换为可识别的 transform 信息
 * @param m
 * @example https://stackoverflow.com/questions/16359246/how-to-extract-position-rotation-and-scale-from-matrix-svg
 */
export function decomposeMatrix2DW3(m) {
  let row0x = m.a;
  let row0y = m.b;
  let row1x = m.c;
  let row1y = m.d;

  let scaleX = Math.sqrt(row0x * row0x + row0y * row0y);
  let scaleY = Math.sqrt(row1x * row1x + row1y * row1y);

  // If determinant is negative, one axis was flipped.
  let determinant = row0x * row1y - row0y * row1x;
  if (determinant < 0)
    if (row0x < row1y)
      // Flip axis with minimum unit vector dot product.
      scaleX = -scaleX;
    else scaleY = -scaleY;

  // Renormalize matrix to remove scale.
  if (scaleX) {
    row0x *= 1 / scaleX;
    row0y *= 1 / scaleX;
  }

  if (scaleY) {
    row1x *= 1 / scaleY;
    row1y *= 1 / scaleY;
  }

  // Compute rotation and renormalize matrix.
  let angle = Math.atan2(row0y, row0x);

  if (angle) {
    // Rotate(-angle) = [cos(angle), sin(angle), -sin(angle), cos(angle)]
    //                = [row0x, -row0y, row0y, row0x]
    // Thanks to the normalization above.
    let sn = -row0y;
    let cs = row0x;
    let m11 = row0x;
    let m12 = row0y;
    let m21 = row1x;
    let m22 = row1y;
    row0x = cs * m11 + sn * m21;
    row0y = cs * m12 + sn * m22;
    row1x = -sn * m11 + cs * m21;
    row1y = -sn * m12 + cs * m22;
  }

  let m11 = row0x;
  let m12 = row0y;
  let m21 = row1x;
  let m22 = row1y;

  // Convert into degrees because our rotation functions expect it.
  angle = angle * (180 / Math.PI);
  // The requested parameters are then theta,
  // sx, sy, phi,
  return {
    translateX: m.e,
    translateY: m.f,
    rotateZ: angle,
    scaleX: scaleX,
    scaleY: scaleY,
    matrix: [m11, m12, m21, m22, 0, 0],
  };
}
