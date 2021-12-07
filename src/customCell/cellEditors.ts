import type { column, cell } from "./cellRenderers";
import Store from "../store";
import formula from "../global/formula";

export type EditParams = {
  rowIndex: number;
  colIndex: number;
  column: column;
  columns: column[];
  cell: cell;
  value: any;
};

export type FormatValueBeforeEditParams = {
  value: string;
  cellParams: {
    [key: string]: any;
  };
};

export abstract class CellEditors {
  //  编辑完成后需要存入到 cell 中的值
  abstract getFinalValue(): any;

  //  cell 编辑时执行, 返回一个编辑的 DOM 节点
  abstract edit(EditParams: EditParams): Element;

  //  cell editor 销毁前调用
  abstract beforeDestroy(el: Element, editBox: Element): void;

  //  cell editor 销毁后调用
  abstract afterDestroy(): void;

  //  在进入渲染 cell editor 前, 提前处理 value 值
  abstract formatValueBeforeEdit(
    FormatValueBeforeEditParams: FormatValueBeforeEditParams
  ): any;

  /**
   * 关闭编辑, 更新值
   */
  public finishEdit() {
    if (Store.luckysheetCellUpdate.length > 0) {
      const [r, c] = Store.luckysheetCellUpdate;
      formula.updatecell(r, c);
    } else {
      console.log("无法找到当前 row_index 和 col_index", Store);
    }
  }

  /**
   * 停止编辑, 不会更新值
   */
  public stopEdit() {
    formula.dontupdate()
  }
}
