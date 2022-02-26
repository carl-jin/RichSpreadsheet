//
//  该文件用于处理 column 分组的功能

/**
 *  逻辑
 *
 *  打组的功能，主要就是借助于 hideColumnByIndex 和 showColumnByIndex 这两个方法，
 *  来实现显示隐藏
 *
 *  在 column 渲染时会调用 RenderGroupLinkLineOnColumnHeader 方法来渲染连线和展开收起按钮
 *
 *  表格初始化时，会调用 columnsGroupSettingRestore 方法通过 Store.config.columnsGroup 来预处理 colhiden 配置，
 *  将收起的 group 中所有的 column 都放到 colhidden 配置里面
 *
 *  提供 ColumnsGroupChange 事件用于监听状态改变
 *
 *  以下是一些规则判断
 *  1. 只支持一级的打组功能
 *  2. 打组的 columns 不能以第一个 column (index === 0) 开始，不然 handler 没地方放
 *     google sheet 是可以的，遇到这种情况，它会把 handler 放到右侧，但是这样要处理起来就麻烦多了（时间不允许）
 *  3. 不允许在跨冻结区域打组
 *  4. 不允许在打组范围内冻结
 *  5. 如果把 handler 隐藏掉，会直接取消打组
 *  6. 如果把 group 中的最后一个 column 隐藏，则会直接取消打组
 *  7. 不允许在 group 范围内或者交叉范围内再次打组 (也就是不支持 二级）
 *
 */

export * from "./render";
export * from "./helpers";
export * from "./types";
