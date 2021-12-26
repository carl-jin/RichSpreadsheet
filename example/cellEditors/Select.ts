import {
  CellEditors,
  EditParams,
} from "../../src";

export class Select extends CellEditors {
  private $el: HTMLDivElement = document.createElement("div");
  private value: any = "";

  getFinalValue(): any {
    return this.value;
  }

  edit({ value }: EditParams): Element {
    this.$el.style.cssText = `width:80px;height:80px;border: 2px solid #f20;`;
    this.value = value;
    this.$el.innerHTML = value + "看到的";

    const btn = document.createElement("button");
    btn.innerHTML = "点我关闭";
    this.$el.append(btn);
    btn.addEventListener("click", () => {
      this.stopEdit();
    });
    return this.$el;
  }

  beforeDestroy(el: Element, editBox: Element) {
    console.log("before 销毁");
  }

  afterDestroy() {
    console.log("after x销毁");
  }

  afterMounted(DOM: HTMLElement): void {
  }
}
