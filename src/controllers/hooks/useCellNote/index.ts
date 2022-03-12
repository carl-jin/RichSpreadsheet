//  单元格 备注 功能

//  实现逻辑
//  由于后端接口是异步请求单元格的备注信息，所以不能直接在表格初始化的时候渲染
//  使用 updateCellsNote(Note[]) 接口来更新单元格的备注信息
//  当 cell 渲染时，判断 richSpreadSheetCellNote 中能否找到对应的 note，
//  如果找到匹配的 note 的话，调用 CellNoteRenderTriangle() 来在右上角显示个 三角形
//  用户点击单元格时，如果有备注信息则直接显示备注的 dom

//  copy 时候 note 该如何处理？回退时？
import "./style.less";
import type { Note } from "./types";

declare global {
  //  添加 window 上的全局变量
  interface Window {
    richSpreadSheetCellNote: Note[];
  }
}

window.richSpreadSheetCellNote = window.richSpreadSheetCellNote ?? [];

export const defaultNoteWidth = 200;
export const defaultNoteHeight = 80;

export * from "./utils";
export * from "./types";
