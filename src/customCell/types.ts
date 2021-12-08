export type column = {
  id: string;
  headerName: string;
  cellParams: {
    [key: string]: any;
  };
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
};

export type FormatValueBeforeRenderParams = {
  value: string;
  cellParams: {
    [key: string]: any;
  };
};

export type CellRenderersMouseEventParams = CellRenderersParams & {
  mouseEvent: {
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
};

export type FormatValueBeforeEditParams = {
  value: string;
  cellParams: {
    [key: string]: any;
  };
};
