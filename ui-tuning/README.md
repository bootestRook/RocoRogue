# RocoRogue UI 手动调节模式

## 如何运行

双击仓库根目录的 `UI.bat`。

它会启动与 `run.bat` 相同的 `rocorogue-public` webapp，但使用独立端口：

- 默认从 `4174` 开始查找可用端口
- 自动打开 `http://127.0.0.1:4174/?v=1&uiTune=1#/mechanics?view=pet-box`
- 设置 `ROCO_UI_TUNER=1` 和 `VITE_ROCO_UI_TUNER=1`

`run.bat` 不会加载 UI 调节器，不会读取调节草稿，也不会应用导出的布局。

默认 `uiTune=1` 只加载调节器，不会自动套用浏览器里保存过的旧草稿布局。需要恢复旧草稿时，在 URL 里额外加 `uiTuneRestore=1`。

## 快捷键

- `Ctrl + Shift + U`：开启/关闭手动调节模式
- 鼠标点击：选择元素
- 鼠标拖拽：移动选中元素
- 方向键：移动 1px
- `Shift + 方向键`：移动 10px
- `Alt + 方向键`：移动 0.25px
- `[`：缩小 1%
- `]`：放大 1%
- `Shift + [` / `Shift + ]`：缩小/放大 5%
- `Alt + [` / `Alt + ]`：缩小/放大 0.1%
- 鼠标滚轮悬停在选中元素上：缩放选中元素并阻止页面滚动
- `Delete` 或 `Backspace`：删除选中元素
- `Ctrl + Z`：撤销
- `Ctrl + Y` 或 `Ctrl + Shift + Z`：重做
- `Esc`：取消选中
- `Ctrl + S`：保存草稿
- `Ctrl + E`：导出布局文件

调节器不会显示参数面板、侧边栏、modal、dat.GUI、leva 或 lil-gui。视觉反馈只包含 hover 高亮、选中描边、元素 ID 小提示和极简 toast。

## 保存与导出位置

`Ctrl + S` 会保存两份草稿：

- 浏览器 `localStorage`：键名 `roco.uiTuner.layout.v1`
- 仓库文件：`ui-tuning/latest.layout.json`

仓库文件写入依赖 `UI.bat` 启动的 Node 本地服务器接口 `POST /__ui_tuner/save`。如果接口不可用，仍会保留 localStorage 草稿。

`Ctrl + E` 会触发浏览器下载：

- `roco-ui-layout-export.json`

浏览器下载位置取决于当前浏览器设置，通常是系统“下载”目录。

## 导出 JSON 字段

导出文件结构：

- `version`：布局文件版本，目前为 `1`
- `app`：应用名，固定为 `RocoRogue`
- `mode`：固定为 `ui-tuner`
- `createdAt`：导出时间，ISO 字符串
- `route`：导出时的页面路径、查询参数和 hash
- `viewport`：视口宽高、`devicePixelRatio`，固定设计稿页面会额外包含 `designWidth` / `designHeight`
- `base.gitCommit`：导出时能读取到的 Git commit，否则为 `null`
- `base.branch`：导出时能读取到的 Git 分支，否则为 `null`
- `items`：按稳定 UI ID 记录的元素布局

每个 `items[id]` 包含：

- `id`：稳定组件 ID，例如 `bag.detailPanel`
- `label`：组件说明
- `selector`：对应 DOM 选择器
- `sourceHint`：后续回写源码时参考的文件、组件和样式文件
- `transform.x` / `transform.y`：相对原始位置的位移
- `transform.scaleX` / `transform.scaleY`：相对原始尺寸的缩放
- `transform.origin`：缩放原点
- `deleted`：是否在调节预览中删除该元素
- `boundsBefore`：调节前的屏幕边界
- `boundsAfter`：调节后的屏幕边界

## 后续如何交给 Codex 回写主 UI

完成手动调节后，把 `ui-tuning/latest.layout.json` 或下载的 `roco-ui-layout-export.json` 交给 Codex，并明确说：

> 根据这份 UI 调节导出文件，把主进程 UI 的位置和缩放回写到源码。

Codex 会读取每个 item 的 `id`、`sourceHint` 和 `transform`，再把对应位移/缩放转成主 UI 的布局 token、CSS 变量、固定坐标或组件样式修改。调节 JSON 不会被 `run.bat` 自动应用。
