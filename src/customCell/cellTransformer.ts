/**
 * 单元格数据转换器
 * FormatValueFromData 数据从数据库中读取出来后，再使用前的转换
 * parseValueToData 数据经过用户操作后，再存入数据库前的转换
 * parseFromClipboard 数据经过 paste 粘贴后的处理，得到的值再次经过 parseValueToData 处理
 */
import { CustomBase } from "./customBase";

abstract class CellTransformer extends CustomBase {
  public abstract formatValueFromData(
    value: any,
    cellParams: any,
    column: any
  ): any;
  public abstract parseValueToData(
    value: any,
    cellParams: any,
    column: any
  ): string;
  public abstract parseFromClipboard(value: any, cellParams: any): string;
}

export { CellTransformer };
