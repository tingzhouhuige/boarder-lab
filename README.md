# 边框实验室

边框实验室是一个可直接在浏览器打开的静态网页工具，用于给照片添加边框、读取常见 EXIF 信息，并导出带标注的成片。

这个项目偏向摄影成片场景，重点是白框、壹印风格模板、EXIF 信息排版，以及所见即所得的预览体验。

## 功能亮点

- 导入 `JPG / JPEG / PNG / WebP`
- 读取常见 JPEG EXIF 信息
- 自动追加拍摄日期、镜头信息、焦段
- 实时预览，支持滚轮缩放和拖拽查看
- 调整边框、底部说明区、字体、字号、位置、颜色
- 提供多套横屏 / 竖屏模板
- 导出 `JPG`
- 导出圆角 `PNG`
- 导出时可限制最长边

## 当前模板

- 模板 1：横屏白框
- 模板 2：竖屏白框
- 模板 3：横屏壹印
- 模板 4：竖屏壹印

## 适合的使用场景

- 给摄影作品统一加边框和信息标注
- 快速生成社交平台分享图
- 做横屏、竖屏两套成片排版
- 制作带日期、镜头、焦段信息的展示图

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
│  ├─ template-classic.jpg
│  ├─ template-classic-alt.jpg
│  └─ template-dark.jpg
├─ app.js
├─ main.js
├─ preload.js
├─ index.html
├─ package.json
├─ styles.css
├─ README.md
├─ RELEASE_NOTES_v1.0.1.md
└─ GITHUB_RELEASE_GUIDE.md
```

## 发布到 GitHub

### 上传仓库

把以下文件上传到 GitHub 仓库根目录：

- `index.html`
- `styles.css`
- `app.js`
- `assets/`
- `README.md`

### 创建 Release

推荐每次发布都打一个版本号，例如：

- `v1.0.1`
- `v1.0.2`
- `v1.1.0`

可参考仓库内的：

- `GITHUB_RELEASE_GUIDE.md`
- `RELEASE_NOTES_v1.0.1.md`

### 启用 GitHub Pages

如果你希望用户在线打开：

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
