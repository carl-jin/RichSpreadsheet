import { column } from "../customCell/types";

export type ColumnTitleRenderParams = {
  colIndex: number;
  column: column;
  columns: column[];
  columnWidth: number;
  columnHeight: number;
  positionX: number;
  positionY: number;
  ctx: CanvasRenderingContext2D;
};

export type ColumnHeaderRenderMouseEventParams = ColumnTitleRenderParams & {
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
