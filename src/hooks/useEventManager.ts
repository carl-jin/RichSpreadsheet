//
//  事件中心管理
//  支持的事件
//  ColumnsWidthChanged  columns 宽度改变时触发
//  RowHeightChanged     行高改变
//  FrozenChanged        冻结行列改变时触发
//  CellValueUpdated     cell 的值发生了改变
//  CantEditReadonly     无法编辑只读 column
//  sheetEmptied         sheet 一条数据都没有时触发
//  cancelFrozenAutomatically 自动取消冻结（当冻结区域溢出时触发）
//  cellSelected         当 cell 被 selected 时触发
//  cellUnEditable       当尝试编辑 unEditable 的 cell 时
//  cellDbClick          当 cell 被双击时，是否要进入编辑状态

export function useEventManager() {
  let evenList = {};

  function $on(eventName: string, callback: Function) {
    evenList[eventName]
      ? evenList[eventName].push(callback)
      : (evenList[eventName] = [callback]);
    let isSubscribed = true; // 注册凭证

    return function unsubscribe() {
      if (!isSubscribed) {
        // 防止 unsubscribe 被多次执行
        return;
      }
      isSubscribed = false;

      // 找到队列中的函数，剔除
      const index = evenList[eventName].indexOf(callback);
      evenList[eventName].splice(index, 1);
    };
  }

  function $emit(eventName: string, ...args): boolean {
    let result = true;
    if (evenList[eventName]) {
      for (let i = 0; i < evenList[eventName].length; i++) {
        let cb = evenList[eventName][i];

        if (cb(...args) === false) {
          result = false;
        }

        //  如果一旦有一个返回 false，则直接退出循环
        if (!result) {
          break;
        }
      }
    }

    return result;
  }

  function destroy() {
    evenList = {};
  }

  return {
    $on,
    $emit,
    destroy,
  };
}
