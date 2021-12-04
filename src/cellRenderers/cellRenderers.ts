type column = {
  id: string;
  headerName: string;
  cellParams: {
    [key: string]: any;
  };
};

type cell = {
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
};

export type FormatValueBeforeRenderParams = {
  value: string;
  cellParams: {
    [key: string]: any;
  };
};

export type CellRenderersMouseEventParams = CellRenderersParams & {
  mouseEvent:{
    mouse_x: number;
    mouse_y:number;
  }
};

export abstract class CellRenderers {
  //  cell 渲染方法
  abstract render(CellRenderersParams: CellRenderersParams): void;

  //  鼠标移入单元格时的渲染
  //  如果不需要使用可以直接将参数传递给 render 或者 return false
  abstract mouseenterRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void;

  //  鼠标在单元格中移动时的渲染
  //  如果不需要使用可以直接将参数传递给 render 或者 return false
  abstract mousemoveRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void;

  //  鼠标移开单元格时的渲染
  //  如果不需要使用可以直接将参数传递给 render 或者 return false
  abstract mouseoutRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void;

  abstract formatValueBeforeRender(
    FormatValueBeforeRenderParams: FormatValueBeforeRenderParams
  ): any;
}
