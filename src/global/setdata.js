import { getObjType } from "../utils/util";
import { isRealNull, isRealNum, valueIsError } from "./validate";
import { genarate, update } from "./format";
import server from "../controllers/server";
import luckysheetConfigsetting from "../controllers/luckysheetConfigsetting";
import Store from "../store";
import {
  getColumnByColIndex,
  getOutputFromColumnTransformerParseValueToDataByValue,
  updateSpecificCellData,
} from "./apiHelper";
import {
  deepClone,
  getCellDataRowByRowIndex,
} from "../controllers/hooks/helper";
import { reFreshCellByCoord } from "../customCell/helper/baseMethods";

/**
 * 设置 cell 的值
 * @param r rowIndex
 * @param c colIndex
 * @param d database = Store.flowdata
 * @param v value
 * @param options
 */
function setcellvalue(r, c, d, v, options) {
  options = Object.assign(
    {
      silent: false, //  如果为 true 时，不会触发 CellValueUpdated 事件
      force: false, //  如果为 true 时，将会强行更新（因为如果 cell 值前后一样的话是不会更新的）
      reRenderCell: false, //  是否重新渲染单元格，默认情况下是不渲染，因为 luckysheet 内部调用时会自动重新渲染整个表格
    },
    options
  );

  if (d == null) {
    d = Store.flowdata;
  }

  //  如果值存在，代表着这是个更新的操作，反之为初始化数据库
  if (d[r][c]) {
    //  这个 v 需要经过 transformer 处理才能放入数据
    let colId = getColumnByColIndex(c).id;
    v = getOutputFromColumnTransformerParseValueToDataByValue(colId, v);

    let newValue = v;
    //  如果是 '[]' 或者 '{}' 都认定为空字符串
    let emptyLikeStringArr = ["[]", "{}"];
    newValue = !!~emptyLikeStringArr.indexOf(newValue) ? "" : newValue;
    //  判断值是否一样，如果前后的值一样跳过更新
    const oldValue = d[r][c].v;
    if (oldValue === v || (newValue === oldValue && oldValue === "")) {
      if (!options.force) {
        return;
      }
    }

    //  判断是否是 readonly 字段，如果是跳过更新
    const column = getColumnByColIndex(c);
    if (column.readonly && !options.force) {
      return;
    }

    updateSpecificCellData(r, c, v);
    if (!options.silent) {
      const column = getColumnByColIndex(c);
      const row = getCellDataRowByRowIndex(r);
      Store.$emit("CellValueUpdated", {
        rowIndex: r,
        colIndex: c,
        value: v,
        rowId: row.id,
        colId: column.id,
        row: row,
        column: column,
        oldValue: oldValue,
      });
    }

    d[r][c].v = v;
    options.reRenderCell && reFreshCellByCoord(r, c);
  } else {
    d[r][c] = {
      ct: { fa: "@", t: "s" },
      v: v,
    };
  }

  /*
  return;

  let vupdate;

  if (getObjType(v) == "object") {
    if (cell == null) {
      cell = v;
    } else {
      if (v.f != null) {
        cell.f = v.f;
      } else if (cell.hasOwnProperty("f")) {
        delete cell.f;
      }

      if (v.spl != null) {
        cell.spl = v.spl;
      }

      if (v.ct != null) {
        cell.ct = v.ct;
      }
    }

    if (getObjType(v.v) == "object") {
      vupdate = v.v.v;
    } else {
      vupdate = v.v;
    }
  } else {
    vupdate = v;
  }

  if (isRealNull(vupdate)) {
    if (getObjType(cell) == "object") {
      delete cell.m;
      delete cell.v;
    } else {
      cell = null;
    }

    d[r][c] = cell;

    return;
  }

  // 1.为null
  // 2.数据透视表的数据，flowdata的每个数据可能为字符串，结果就是cell == v == 一个字符串或者数字数据
  if (
    isRealNull(cell) ||
    ((getObjType(cell) === "string" || getObjType(cell) === "number") &&
      cell === v)
  ) {
    cell = {};
  }

  let vupdateStr = vupdate.toString();

  if (vupdateStr.substr(0, 1) == "'") {
    cell.m = vupdateStr.substr(1);
    cell.ct = { fa: "@", t: "s" };
    cell.v = vupdateStr.substr(1);
    cell.qp = 1;
  } else if (cell.qp == 1) {
    cell.m = vupdateStr;
    cell.ct = { fa: "@", t: "s" };
    cell.v = vupdateStr;
  } else if (vupdateStr.toUpperCase() === "TRUE") {
    cell.m = "TRUE";
    cell.ct = { fa: "General", t: "b" };
    cell.v = true;
  } else if (vupdateStr.toUpperCase() === "FALSE") {
    cell.m = "FALSE";
    cell.ct = { fa: "General", t: "b" };
    cell.v = false;
  } else if (
    vupdateStr.substr(-1) === "%" &&
    isRealNum(vupdateStr.substring(0, vupdateStr.length - 1))
  ) {
    cell.ct = { fa: "0%", t: "n" };
    cell.v = vupdateStr.substring(0, vupdateStr.length - 1) / 100;
    cell.m = vupdate;
  } else if (valueIsError(vupdate)) {
    cell.m = vupdateStr;
    // cell.ct = { "fa": "General", "t": "e" };
    if (cell.ct != null) {
      cell.ct.t = "e";
    } else {
      cell.ct = { fa: "General", t: "e" };
    }
    cell.v = vupdate;
  } else {
    if (
      cell.f != null &&
      isRealNum(vupdate) &&
      !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(
        vupdate
      )
    ) {
      cell.v = parseFloat(vupdate);
      if (cell.ct == null) {
        cell.ct = { fa: "General", t: "n" };
      }

      if (cell.v == Infinity || cell.v == -Infinity) {
        cell.m = cell.v.toString();
      } else {
        if (cell.v.toString().indexOf("e") > -1) {
          let len;
          if (cell.v.toString().split(".").length == 1) {
            len = 0;
          } else {
            len = cell.v.toString().split(".")[1].split("e")[0].length;
          }
          if (len > 5) {
            len = 5;
          }

          cell.m = cell.v.toExponential(len).toString();
        } else {
          let v_p = Math.round(cell.v * 1000000000) / 1000000000;
          if (cell.ct == null) {
            let mask = genarate(v_p);
            cell.m = mask[0].toString();
          } else {
            let mask = update(cell.ct.fa, v_p);
            cell.m = mask.toString();
          }

          // cell.m = mask[0].toString();
        }
      }
    } else if (cell.ct != null && cell.ct.fa == "@") {
      cell.m = vupdateStr;
      cell.v = vupdate;
    } else if (
      cell.ct != null &&
      cell.ct.fa != null &&
      cell.ct.fa != "General"
    ) {
      if (isRealNum(vupdate)) {
        vupdate = parseFloat(vupdate);
      }

      let mask = update(cell.ct.fa, vupdate);

      if (mask === vupdate) {
        //若原来单元格格式 应用不了 要更新的值，则获取更新值的 格式
        mask = genarate(vupdate);

        cell.m = mask[0].toString();
        cell.ct = mask[1];
        cell.v = mask[2];
      } else {
        cell.m = mask.toString();
        cell.v = vupdate;
      }
    } else {
      if (
        isRealNum(vupdate) &&
        !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(
          vupdate
        )
      ) {
        if (typeof vupdate === "string") {
          let flag = vupdate.split("").every((ele) => ele == "0" || ele == ".");
          if (flag) {
            vupdate = parseFloat(vupdate);
          }
        }
        cell.v =
          vupdate; /!* 备注：如果使用parseFloat，1.1111111111111111会转换为1.1111111111111112 ? *!/
        cell.ct = { fa: "General", t: "n" };
        if (cell.v == Infinity || cell.v == -Infinity) {
          cell.m = cell.v.toString();
        } else {
          let mask = genarate(cell.v);

          cell.m = mask[0].toString();
        }
      } else {
        let mask = genarate(vupdate);

        cell.m = mask[0].toString();
        cell.ct = mask[1];
        cell.v = mask[2];
      }
    }
  }

  if (!server.allowUpdate && !luckysheetConfigsetting.pointEdit) {
    if (
      cell.ct != null &&
      /^(w|W)((0?)|(0\.0+))$/.test(cell.ct.fa) == false &&
      cell.ct.t == "n" &&
      cell.v != null &&
      parseInt(cell.v).toString().length > 4
    ) {
      let autoFormatw = luckysheetConfigsetting.autoFormatw
        .toString()
        .toUpperCase();
      let accuracy = luckysheetConfigsetting.accuracy;

      let sfmt = setAccuracy(autoFormatw, accuracy);

      if (sfmt != "General") {
        cell.ct.fa = sfmt;
        cell.m = update(sfmt, cell.v);
      }
    }
  }

  d[r][c] = cell;*/
}

//new runze 根据亿万格式autoFormatw和精确度accuracy 转换成 w/w0/w0.00 or 0/0.0格式
function setAccuracy(autoFormatw, accuracy) {
  let acc = "0.";
  let fmt;

  if (autoFormatw == "TRUE") {
    if (accuracy == undefined) {
      return "w";
    } else {
      let alength = parseInt(accuracy);

      if (alength == 0) {
        return "w0";
      } else {
        acc = "w0.";

        for (let i = 0; i < alength; i++) {
          acc += "0";
        }

        fmt = acc;
      }
    }
  } else {
    if (accuracy == undefined) {
      return "General";
    } else {
      let alength = parseInt(accuracy);

      if (alength == 0) {
        return "0";
      } else {
        for (let i = 0; i < alength; i++) {
          acc += "0";
        }

        fmt = acc;
      }
    }
  }

  return fmt.toString();
}

export { setcellvalue, setAccuracy };
