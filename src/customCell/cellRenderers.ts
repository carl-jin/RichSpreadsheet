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

abstract class CellRenderers {
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

  /**
   * 在 render 时候显示一串额外的 dom
   */
  public showDom(){
    //  todo 如何关闭? 什么时候关闭?
  }

  public startEdit(){
    //  todo 调用 下面这个 dblclick , 然后模拟下event 事件, 让他能够通过 event 找到对应的 mouse 事件
    // C:\Users\tomgr\Desktop\RichSpreadsheet\src\controllers\handler.js
  }
}

export{
  CellRenderers
}
