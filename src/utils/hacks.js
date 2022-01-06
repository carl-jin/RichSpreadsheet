/**
 * 判断冻结区域是否超出屏幕显示范围，
 * 如果超出的话，取消冻结
 * @param store
 */
import { cancelFrozenHacks, getCurrentSheet } from "../global/apiHelper";

export function handlerFrozenOverflow(Store) {
  const sheet = getCurrentSheet();
  if (sheet.frozen && sheet.frozen.range) {
    const { column_focus, row_focus } = sheet.frozen.range;
    let isHasCancel = false;

    //  如果 column 冻结溢出
    if (Store.visibledatacolumn[column_focus] + 100 > Store.cellmainWidth) {
      cancelFrozenHacks("column");
      isHasCancel = true;
    }

    if (Store.visibledatarow[row_focus] + 100 > Store.cellmainHeight) {
      cancelFrozenHacks("row");
      isHasCancel = true;
    }

    if (isHasCancel) {
      Store.$emit("cancelFrozenAutomatically");
    }
  }
}
