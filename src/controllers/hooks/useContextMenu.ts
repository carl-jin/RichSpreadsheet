import Store from "../../store";
import { getSheetIndex } from "../../methods/get";
import {
  getColumnsFromSelectedSave,
  getCellDataRowsByIds,
  getRowsIdFromSelectedSave,
} from "./helper";
import { ContentMenuItem } from "../../type";
import { luckysheetContainerFocus } from "../../utils/util";
import { cell, column } from "../../customCell/types";

export type ContextMenuType = "cell" | "column" | "row";

export type ContextMenuParams = {
  columns: column[];
  rows: any[];
  rowIds: string[];
  data: cell[][];
  selection: any[];
  store: any;
  currentSheet: any;
};

/**
 * 根据用户配置渲染 column 右键菜单
 */
function renderContextMenu(type: ContextMenuType) {
  if (Store.luckysheet_select_save.length === 0) return;
  const columns = getColumnsFromSelectedSave();
  const rowIds = getRowsIdFromSelectedSave();
  const rows = getCellDataRowsByIds(rowIds);
  const $menu = $("#luckysheet-rightclick-menu");
  let currentSheet =
    Store.luckysheetfile[getSheetIndex(Store.currentSheetIndex)];

  const options: ContentMenuItem[] = Store.ContextMenu(
    {
      columns,
      rows,
      rowIds,
      data: Store.flowdata,
      selection: Store.luckysheet_select_save,
      store: Store,
      currentSheet,
    },
    type
  );

  //  清空 menu
  $menu.html("");

  //  创建一个 div 用于塞入
  const div = document.createElement("div");
  div.classList.add("context-menu-box");

  options.map((item) => {
    div.appendChild(getItemsDomByOption(item));
  });

  $menu.append(div);
}

/**
 * 通过用户的配置获取对应的 dom 节点
 * @param option
 */
function getItemsDomByOption(option: ContentMenuItem) {
  let divItem = document.createElement("div");
  divItem.classList.add("context-menu-item");
  //  插入分割线
  if (option.separator) {
    divItem.classList.add("separator");
    return divItem;
  }

  //  如果是 disabled 状态
  if (option.disabled) {
    divItem.style.cssText = `
    opacity: .8;
    cursor: not-allowed;
    user-select: none;
    `;
  }

  //  插入 item
  const icon = option.icon ? `<i class="iconfont ${option.icon}"></i>` : ``;
  divItem.innerHTML = `
    <div class="left">
          ${icon}
          <span class="item-name">${option.name}</span>
    </div>
    `;

  //  判断有没有 children
  if (option?.subMenus?.length > 0) {
    const rightArrow = document.createElement("span");
    divItem.classList.add("has-children");
    rightArrow.className = `luckysheet-submenu-arrow iconfont luckysheet-iconfont-youjiantou`;

    const subMenuDiv = document.createElement("div");
    subMenuDiv.className = "context-menu-children";

    option.subMenus.map((item) => {
      subMenuDiv.appendChild(getItemsDomByOption(item));
    });

    divItem.appendChild(rightArrow);
    divItem.appendChild(subMenuDiv);
  }

  //  判断是否有事件
  if (option.action && !option.subMenus && !option.disabled) {
    divItem.addEventListener("click", () => {
      luckysheetContainerFocus();
      option.action();
      $("#luckysheet-rightclick-menu").hide();
    });
  }

  return divItem;
}

export function useContextMenu() {
  return {
    renderContextMenu: renderContextMenu,
  };
}
