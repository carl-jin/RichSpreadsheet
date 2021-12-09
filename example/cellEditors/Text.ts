import {
  CellEditors,
  EditParams,
  FormatValueBeforeEditParams,
} from "../../src";

export class Text extends CellEditors {
  private value: string = "";

  edit(EditParams: EditParams): Element {
    const { value, cellWidth } = EditParams;
    this.value = value;

    //  创建一个 input
    const input = document.createElement("input");

    input.style.cssText = `
      border: none;
      width: 300px;
      outline: none;
      padding: 4px 8px;
    `;
    input.type = "text";

    input.value = this.value;

    input.addEventListener("input", (ev) => {
      const target = ev.target as HTMLInputElement;

      this.value = target.value;
    });

    return input;
  }

  formatValueBeforeEdit(
    FormatValueBeforeEditParams: FormatValueBeforeEditParams
  ): any {
    return FormatValueBeforeEditParams.value;
  }

  afterDestroy(): void {}

  beforeDestroy(el: Element, editBox: Element): void {}

  getFinalValue(): any {
    return this.value;
  }

  afterMounted(DOM: HTMLElement): void {
    setTimeout(() => {
      DOM.focus();
    }, 100);
  }
}
