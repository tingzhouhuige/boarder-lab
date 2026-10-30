# 边框实验室

边框实验室是一个可直接在浏览器打开的静态网页工具，用于给照片添加边框、读取常见 EXIF 信息，并导出带标注的成片。

这个项目偏向摄影成片场景，重点是白框、壹印风格模板、EXIF 信息排版，以及所见即所得的预览体验。

## 功能亮点

### v2.1.0 更新

- 桌面版和网页版共用编辑功能，支持 Ctrl+Z 撤销、Ctrl+Shift+Z 重做（当前会话最近 100 步）。
- 照片文件夹浏览器支持位置记忆、单击单选、Ctrl 多选、Shift 连选和虚拟列表。
- 当前可见照片优先加载，滚动时暂停图片加载，空闲时后台预读并缓存缩略图。
- 桌面版使用独立缩略图进程和磁盘缓存；网页版使用 Web Worker 和 IndexedDB，本地处理照片。
- 新增全屏按钮、自动版本号和底部按钮留白。
- 网页版完整文件夹体验建议使用桌面 Chrome / Edge；其他浏览器保留普通照片导入。文件夹可能需要重新授权，清理网站数据会清除缓存。
- 网页版：[在线使用](https://tingzhouhuige.github.io/boarder-lab/)。Windows 程序见 [v2.1.0 Release](https://github.com/tingzhouhuige/boarder-lab/releases/tag/v2.1.0)。

详细说明见 [RELEASE_NOTES_v2.1.0.md](RELEASE_NOTES_v2.1.0.md)。

- 全新 macOS 风格界面，深色 / 浅色模式切换并自动记忆
- 导入 `JPG / JPEG / PNG / WebP`
- 读取常见 JPEG EXIF 信息（支持等效焦段）
- 自动追加拍摄日期、镜头信息、焦段
- 实时预览，支持滚轮缩放和拖拽查看
- 双击预览中的标题、相机及 EXIF 信息可直接原位修改
- 可开启黄色常亮的「同步全部照片」开关，后续参数实时应用到全部照片
- 调整边框、底部说明区、字体、字号、位置、颜色
- 提供多套横屏 / 竖屏模板
- 导出 `JPG`
- 导出圆角 `PNG`
- 导出时可限制最长边
- 滑块双击恢复当前模板默认值
- 滑块点击后方向键微调（步长 1）
- 自定义水印图片（签名水印模板，设置持久化），一键反色适配深浅背景
- 横竖照片混合批量导出时保持预览中的独立参数、方向和旋转状态

## 当前模板

- 模板 1：白框（经典横屏 / 竖屏）
- 模板 2：纯白框（可调整下方额外留白，支持照片描边）
- 模板 3：纸纹明信片（照片与白边共同覆盖纸张材质）
- 模板 4：壹印（模糊背景横屏 / 竖屏）
- 模板 5：杂志侧栏（左侧照片、右侧相机 / 镜头 / 地点文字）
- 模板 6：签名水印（自定义水印图片）
- 模板 7：哈苏水印（品牌风格）
- 模板 8：尼康水印（品牌风格）

## 适合的使用场景

- 给摄影作品统一加边框和信息标注
- 快速生成社交平台分享图
- 做横屏、竖屏两套成片排版
- 制作带日期、镜头、焦段信息的展示图
- 添加个人版权水印

## 本地使用

直接打开 `index.html` 即可使用。

如果浏览器支持 `showSaveFilePicker`，导出时可以手动选择保存位置和文件名。

## 桌面版（Electron）

项目已经补好了 Electron 桌面壳，可以打包为 Windows `exe`。

### 安装依赖

```bash
npm install
```

### 启动桌面版

```bash
npm start
```

### 打包为 exe

生成便携版：

```bash
npm run dist
```

生成安装版：

```bash
npm run dist:installer
```

打包产物会输出到 `dist/` 目录。

## 项目结构

```text
.
├─ assets/
│  ├─ app-icon.ico
│  ├─ app-icon.png
│  ├─ icon-sizes/
│  ├─ hasselblad-logo.svg
│  ├─ nikon-logo.svg
│  ├─ paper-cotton-surface.png
│  ├─ paper-cotton-surface-2.png
│  ├─ template-classic.jpg
│  ├─ template-classic-alt.jpg
│  └─ template-dark.jpg
├─ app.js
├─ theme.js
├─ paper-surface.js
├─ main.js
├─ preload.js
├─ index.html
├─ package.json
├─ styles.css
├─ vibrancy-light.css
├─ start.bat
└─ README.md
```

## 发布到 GitHub

### 上传仓库

- `index.html`
- `styles.css`
- `vibrancy-light.css`
- `theme.js`
- `app.js`
- `paper-surface.js`
- `main.js`
- `preload.js`
- `assets/`
- `README.md`
- `start.bat`

### 创建 Release

每次发布都打一个版本号，例如：

- `v1.0.1`
- `v1.0.2`
- `v2.0.0`

可参考仓库内的：

- `GITHUB_RELEASE_GUIDE.md`
- `RELEASE_NOTES_v2.0.0.md`

### 启用 GitHub Pages

1. 打开仓库的 `Settings`
2. 进入 `Pages`
3. 在 `Build and deployment` 中选择 `Deploy from a branch`
4. 选择主分支和根目录 `/`
5. 保存后等待生成页面链接

## 注意事项

- `MiSans`、`Angie Sans Std` 等字体只有在系统已安装时才会生效
- PNG / WebP 通常不含标准 EXIF，能导入但不一定能读取拍摄信息
- 壹印模板使用模糊底板样式，边框颜色控件默认不参与显示
- 当前导入链路仍以浏览器原生图片解码为主，`DNG` 暂未直接支持
- 签名水印模板的水印图片需要用户自行选择，设置会自动保存
