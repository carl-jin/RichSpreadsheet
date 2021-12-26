import {CellTransformer} from "../../src";

export class Select extends CellTransformer{
  formatValueFromData(value: any, cellParams: any): any {
    if (!cellParams) return [];
    if (value.length === 0) return [];

    //  判断是否是数组字符串
    try {
      let parseArr = JSON.parse(value);
      return this.transformKeyArrToTitleArr(parseArr, cellParams);
    } catch (e) {
      return [];
    }
  }

  parseFromClipboard(value: any, cellParams: any): string {
    console.log('parseFromClipboard')
    return value;
  }

  parseValueToData(value: any, cellParams: any): string {
    console.log('parseValueToData')
    return "";
  }

  private transformKeyArrToTitleArr(arr: string[], cellParams) {
    let selectOptions = cellParams.options.options;
    let outputArr = [];

    //  找到每个 key 对应的 title
    arr.map((key) => {
      let currentOption = selectOptions.find((option) => option.key === key);
      if (currentOption) {
        outputArr.push(currentOption);
      }
    });

    return outputArr;
  }
}
