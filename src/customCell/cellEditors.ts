import type { EditParams, FormatValueBeforeEditParams } from "./types";
import { CustomBase } from "./customBase";
export abstract class CellEditors extends CustomBase {
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
}
