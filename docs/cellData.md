# cellData 兼容

因为 luckysheet 储存的单元格是 cell 格式

```json
{
  "columnId": "306806b4-4eee-426c-8e16-72fc2eddf4ef",
  "ct": { "fa": "@", "t": "s" },
  "rowId": "a9a72d7c-d4ae-4223-a393-c1d718cbce0a",
  "v": "ZF0L524A1_梨花树"
}
```

但是后台返回的数据, 和用户传入的数据又是这样的

```json
{
  "f57adab3-465e-4ab7-89f1-67b4af47205b": "",
  "id": "a9a72d7c-d4ae-4223-a393-c1d718cbce0a",
  "mtime": 1629283494
}
```

因此在遇到 修改 cell 值, 添加行, 删除行时候, 涉及到了 cell 的更新, 同时也涉及到了用户需要获取对应行的 row 和 column 的具体信息, 如对应的 id, 那么这时候就很难相互同步了

比如用户传入的 CellData 是一个长度为 15 的数组, 生成表格对应的 cell 数据后, 我们执行了删除行操作, 此时表格中的数据是更新了, 但是 cellData 却没有映射, 这导致再次获取 CellData 数据时, 还是老数据

因此用户在外围不应该直接调用 api.js 中的方法, 而是通过一个包装器调用, 这个包装器中, 将会处理 cellData 的同步更新, 比如右键菜单删除行

这样能约束用户层调用接口导致的 cellData 和表格中的 cell 值不同步问题

因此在 apiCellSync.js 中, 每个 api 添加额外的包装方法, 如 insertRowOrColumn 添加其包装方法为 insertRowOrColumn`CellDataSync` 并且提供额外的参数用于在 Api 中处理 Cell 的更新

比如在执行插入行时候, 原来的调用方法为

```javascript
insertRowOrColumn("row", 0, {
  number: 2,
});
```

现在变更为

```javascript
insertRowOrColumnCellDataSync("row", 0, [
  {
    "f57adab3-465e-4ab7-89f1-67b4af47205b": "",
    id: "a9a72d7c-d4ae-4223-a393-c1d718cbce0a",
    mtime: 1629283494,
  },
  {
    "f57adab3-465e-4ab7-89f1-67b4af47205b": "",
    id: "a9a72d7c-d4ae-4223-a393-c1d718cbce0a",
    mtime: 1629283494,
  },
]);
```

## 内部如何实现 cellData 同步?

以下情况需要同步更新 cellData

### cell 值发时改变

### Store.flowdata 被重新赋值

//  todo 完成这个 apiCellSync.js
//  todo 在cell更新时候,同步更新cellData
//  todo 在flowdat 被重新赋值时候, 通过 cellData 获取正确的值
//  todo contenxt menu params 里面的 row 可以为 cellData 对应的 row id 了

