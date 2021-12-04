import { RenderMethods } from "../controllers/hooks/helper";

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
  methods: RenderMethods;
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
  methods: RenderMethods;
};

export type CellRenderersMouseClickParams = CellRenderersMouseEventParams & {
  selectSaveDetail: any;
};

export abstract class CellRenderers {
  //  cell 渲染方法
  abstract render(CellRenderersParams: CellRenderersParams): void;

  //  鼠标移入单元格时的渲染
  abstract mouseenterRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void;

  //  鼠标在单元格中移动时的渲染
  abstract mousemoveRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void;

  //  鼠标移开单元格时的渲染
  abstract mouseoutRender(
    CellRenderersMouseEventParams: CellRenderersMouseEventParams
  ): void;

  //  鼠标点击单元格时的渲染
  abstract clickRender(
    CellRenderersMouseClickParams: CellRenderersMouseClickParams
  ): void;

  //  在进入渲染 Render 前, 提前处理 value 值
  abstract formatValueBeforeRender(
    FormatValueBeforeRenderParams: FormatValueBeforeRenderParams
  ): any;
}
