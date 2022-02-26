import {
  emitMessage,
  getColumnByColIndex,
  hideColumnByIndex,
  showColumnByIndex,
} from "../../global/apiHelper";
import { selectHightlightShow } from "../../controllers/select";
import luckysheetFreezen from "../../controllers/freezen";
import Store from "../../store";
import type { ColumnsGroup, ColumnsGroupConfig } from "./types";
import { jfrefreshgrid_rhcw } from "../../global/refresh";

/**
 * 根据隐藏的 colIndex 来判断是否要取消分组
 * @param colIndex
 */
export function handleColumnHiddenInColumnGroup(colIndex: number) {
  let columnsGroup: ColumnsGroup = Store?.config?.columnsGroup;
  if (!columnsGroup || columnsGroup.length === 0) return false;

  let config = findColumnGroupConfigByColumnIndex(colIndex);
  let columnStatus = detectColumnState(colIndex);

  //  如果当前隐藏的 col 不是在 columns group 期间
  //  那么这里需要判断下 col 的位置，进而更新所有 column group config
  if (!config || !columnStatus) {
    columnsGroup.map((config) => {
      if (colIndex < config.start - 1) {
        config.start -= 1;
        config.end -= 1;
      }
    });

    return;
  }

  //  如果是 handler 隐藏，则取消分组
  if (columnStatus === "handler-add" || columnStatus === "handler-reduce") {
    emitMessage("由于隐藏了分组的列头，将取消分组", "warning");
    //  显示所有被隐藏的 column
    for (let i = config.start - 1; i < config.end; i++) {
      showColumnByIndex(i);
    }

    removeColumnGroup(colIndex, colIndex);
    return;
  }

  //  如果是 group 中最后一个 column，则取消分组
  if (config.start === colIndex && config.end === colIndex) {
    emitMessage("由于隐藏了分组的最后一个列，将取消分组", "warning");
    removeColumnGroup(colIndex, colIndex);
    return;
  }

  //  隐藏列时，end -1
  let targetConfig = Store.config.columnsGroup.find(
    //  @ts-ignore
    (_config) => _config.start === config.start && _config.end === config.end
  );
  if (targetConfig) {
    targetConfig.end -= 1;
  }

  //行高、列宽 刷新
  jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);
}

/**
 * 判断当前冻结的 colIndex 是否在分组的范围内
 * @param colIndex
 */
export function detectColumnInColumnGroup(colIndex: number): boolean {
  if (detectColumnState(colIndex)) {
    emitMessage("无法在列分组内部执行冻结操作", "error");
    return true;
  }
  return false;
}

/**
 * 通过 传入的 colIndex 隐藏 column group
 * @param colIndex
 */
export function hideColumnGroup(colIndex: number) {
  let config = findColumnGroupConfigByColumnIndex(colIndex);
  if (config === false) return;

  //  隐藏 start 到 end 的 column
  for (let i = config.start; i <= config.end; i++) {
    hideColumnByIndex(i, true, true);
  }

  //  更新 store 中的值
  Store.config.columnsGroup.find((configItem) => {
    //  @ts-ignore
    return configItem.start === config.start && configItem.end === config.end;
  }).hide = true;

  Store.$emit("ColumnsGroupChange", Store.config.columnsGroup);
}

/**
 * 通过 传入的 colIndex 显示 column group
 * @param colIndex
 */
export function showColumnGroup(colIndex) {
  let config = findColumnGroupConfigByColumnIndex(colIndex);
  if (config === false) return;

  //  隐藏 start 到 end 的 column
  for (let i = config.start; i <= config.end; i++) {
    showColumnByIndex(i);
  }

  //  更新 store 中的值
  Store.config.columnsGroup.find((configItem) => {
    //  @ts-ignore
    return configItem.start === config.start && configItem.end === config.end;
  }).hide = false;

  Store.luckysheet_select_save = [
    {
      row: [0, Store.flowdata.length - 1],
      column: [config.start, config.end],
      row_focus: 0,
      column_focus: 0,
      row_select: true,
      column_select: true,
    },
  ];
  selectHightlightShow();

  Store.$emit("ColumnsGroupChange", Store.config.columnsGroup);
}

/**
 * 通过 colIndex 找到对应的 config 配置
 * 注意： start - 1 (handler column) 也同样可以获取配置
 * @param colIndex
 */
export function findColumnGroupConfigByColumnIndex(
  columnIndex: number
): ColumnsGroupConfig | false {
  let columnsGroup: ColumnsGroup = Store?.config?.columnsGroup;
  if (!columnsGroup || columnsGroup.length === 0) return false;

  for (let i = 0; i < columnsGroup.length; i++) {
    let config = columnsGroup[i];
    if (columnIndex === config.start - 1) {
      return config;
    }
    if (columnIndex >= config.start && columnIndex < config.end) {
      return config;
    }
    if (columnIndex === config.end) {
      return config;
    }
  }

  return false;
}

/**
 * 判断当前给定的 column index 的状态
 * handler 代表着 start - 1 的 column， 用于显示加号/减号
 * group 代表着这个 column 在 index >= start && index < end 范围
 * end 代表着这个 column 是结束的最后一个
 * false 则不存在于任何分组关系
 * @param columnIndex
 */
export function detectColumnState(
  columnIndex: number
): "handler-add" | "handler-reduce" | "group" | "end" | false {
  let columnsGroup: ColumnsGroup = Store?.config?.columnsGroup;
  if (!columnsGroup || columnsGroup.length === 0) return false;

  for (let i = 0; i < columnsGroup.length; i++) {
    let config = columnsGroup[i];
    if (columnIndex === config.start - 1) {
      return config.hide ? "handler-add" : "handler-reduce";
    }
    if (columnIndex >= config.start && columnIndex < config.end) {
      return "group";
    }
    if (columnIndex === config.end) {
      return "end";
    }
  }

  return false;
}

/**
 * 取消分组
 * @param start
 * @param end
 * @param stopEvent 是否禁止事件传播
 */
export function removeColumnGroup(
  start: number,
  end: number,
  stopEvent: boolean = false
) {
  //  获取从 start end 期间，对应的所有 config
  let groupConfigs: ColumnsGroup = [];
  for (let i = start; i <= end; i++) {
    let config = findColumnGroupConfigByColumnIndex(i);
    if (config) {
      groupConfigs.push(config);
    }
  }

  //  遍历 configs
  for (let i = 0; i < groupConfigs.length; i++) {
    let config = groupConfigs[i];

    //  如果 config 个中 hide 为 true
    //  则将其中所有隐藏的节点显示出来
    if (config.hide) {
      for (let j = config.start; j <= config.end; j++) {
        showColumnByIndex(j);
      }
    }

    //  从 columnsGroup 中删除对应 config
    let targetConfig = Store.config.columnsGroup.find(
      (_config) => _config.start === config.start && _config.end === config.end
    );
    if (targetConfig) {
      let index = Store.config.columnsGroup.indexOf(targetConfig);
      Store.config.columnsGroup.splice(index, 1);
    }
  }

  //行高、列宽 刷新
  jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);

  !stopEvent && Store.$emit("ColumnsGroupChange", Store.config.columnsGroup);
}

/**
 * 设置分组
 * @param start
 * @param end
 * @param stopEvent 是否禁止事件传播
 */
export function setColumnGroup(
  start: number,
  end: number,
  stopEvent: boolean = false
) {
  let startColumn = getColumnByColIndex(start);
  let endColumn = getColumnByColIndex(end);

  if (!startColumn || !endColumn) {
    return;
  }

  //  分组的 columns 不能以第一个 column (index === 0) 开始，不然 handler 没地方放
  if (start === 0) {
    emitMessage("无法在包含第一列的情况下执行分组", "error");
    return;
  }

  //  分组的 columns 不能是冻结右侧的第一个值，同样的 handler 没地方放
  if (luckysheetFreezen.freezenverticaldata) {
    if (luckysheetFreezen.freezenverticaldata[1] === start) {
      emitMessage("无法在包含冻结后的第一列的情况下执行分组", "error");
      return;
    }
  }

  //  不允许在冻结区域内分组
  if (luckysheetFreezen.freezenverticaldata) {
    if (
      start < luckysheetFreezen.freezenverticaldata[1] &&
      luckysheetFreezen.freezenverticaldata[1] <= end
    ) {
      emitMessage("无法在跨冻结区域分组", "error");
      return;
    }
  }

  //  不允许在交叉范围内分组
  let columnsGroup: ColumnsGroup = Store?.config?.columnsGroup;
  if (columnsGroup && columnsGroup.length > 0) {
    for (let i = 0; i < columnsGroup.length; i++) {
      let config = columnsGroup[i];
      let isIntersect = ArrayIntersection(
        //  这里 +1 是因为 handler 也计算在分组范围内
        [config.start, config.end + 1],
        [start, end]
      );
      if (isIntersect) {
        emitMessage("无法已存在的分组的列中，再次执行分组操作", "error");
        return;
      }
    }
  }

  //  塞入分组配置
  Store.config.columnsGroup = Store.config.columnsGroup ?? [];
  Store.config.columnsGroup.push({
    start,
    end,
    hide: false,
  });

  //行高、列宽 刷新
  jfrefreshgrid_rhcw(Store.flowdata.length, Store.flowdata[0].length);

  !stopEvent && Store.$emit("ColumnsGroupChange", Store.config.columnsGroup);
}

function ArrayIntersection(arr1, arr2) {
  let start = [Math.min(...arr1), Math.min(...arr2)]; //区间的两个最小值
  let end = [Math.max(...arr1), Math.max(...arr2)]; //区间的两个最大值
  return Math.max(...start) <= Math.min(...end); //最大值里的最小值 是否 小于等于 最大值的最小值
}
