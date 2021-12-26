import type { EditParams } from "./types";
import { CustomBase } from "./customBase";

export abstract class CellEditors extends CustomBase {
  //  编辑完成后需要存入到 cell 中的值
  public abstract getFinalValue(): any;

  //  cell 编辑时执行, 返回一个编辑的 DOM 节点
  public abstract edit(EditParams: EditParams): Element;

  //  cell editor 销毁前调用
  protected beforeDestroy?(el: Element, editBox: Element): void;

  //  cell editor 销毁后调用
  protected afterDestroy?(): void;

  //  当 dom 塞入后触发
  protected afterMounted?(DOM: HTMLElement): void;
}
