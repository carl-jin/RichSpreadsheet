import type { EditParams } from "./types";
import { CustomBase } from "./customBase";

export abstract class CellEditors extends CustomBase {
  //  编辑完成后需要存入到 cell 中的值
  public abstract getFinalValue(): any;

  //  cell 编辑时执行, 返回一个编辑的 DOM 节点
  //  如果返回 Dom 则使用 返回的 Dom 渲染
  //  如果未返回 Dom 则按照传入的 DOM 进行渲染，这个传入的 DOM 可以给 vue 组件 $mount() 使用
  public abstract edit(EditParams: EditParams, Dom: HTMLDivElement): Element | void;

  //  cell editor 销毁前调用
  protected beforeDestroy?(el: Element, editBox: Element): void;

  //  cell editor 销毁后调用
  protected afterDestroy?(): void;

  //  当 dom 塞入后触发
  protected afterMounted?(DOM: HTMLElement): void;

  //  如果返回 true 则代表使用 absolute 定位来显示编辑框
  protected isPopup?(): boolean;
}
