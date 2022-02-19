export type column = {
  id: string;
  headerName: string;
  cellParams: {
    [key: string]: any;
  };
  dataVerification: Array<{
    pattern: string;
    errorMessage: string;
  }>;
};

export type cell = {
  v: string;
};

export type CellRenderersParams = {
  rowIndex: number;
  colIndex: number;
  column: column;
  columns: column[];
  cell: cell;
  value: any;
  cellWidth: number;
  cellHeight: number;
  spaceX: number;
  spaceY: number;
  ctx: CanvasRenderingContext2D;
  positionX: number;
  positionY: number;
  [key: string]: any;
};

export type FormatValueFromData = {
  value: string;
  cellParams: {
    [key: string]: any;
  };
};

export type CellRenderersMouseEventParams = CellRenderersParams & {
  //  相对于全局的 mouse 事件
  mouseEvent: {
    mouse_x: number;
    mouse_y: number;
  };
  //  相对于表格主体（不包含 column header 和 row header 的 mouse event）
  relatedMouseEvent: {
    mouse_x: number;
    mouse_y: number;
  };
};

export type CellRenderersMouseClickParams = CellRenderersMouseEventParams & {
  selectSaveDetail: any;
};

export type EditParams = {
  rowIndex: number;
  colIndex: number;
  column: column;
  columns: column[];
  cell: cell;
  value: any;
  originalValue: any;
};

type PositionStr = "left" | "right" | "bottom" | "top";

export type ExtractDomConfig =
  | Partial<{
      [key in PositionStr]: HTMLElement | false;
    }>
  | HTMLElement
  | false
  | [HTMLElement, Record<string, string>]
  | [
      Partial<{
        [key in PositionStr]: HTMLElement | false;
      }>,
      Partial<{
        [key in PositionStr]: HTMLElement | false;
      }>
    ];
