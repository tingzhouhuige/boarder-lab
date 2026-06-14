# 边框实验室

边框实验室是一个可直接在浏览器打开的静态网页工具，用于给照片添加边框、读取常见 EXIF 信息，并导出带标注的成片。

这个项目偏向摄影成片场景，重点是白框、壹印风格模板、EXIF 信息排版，以及所见即所得的预览体验。

## 功能亮点

- 导入 `JPG / JPEG / PNG / WebP`
- 读取常见 JPEG EXIF 信息（支持等效焦段）
- 自动追加拍摄日期、镜头信息、焦段
- 实时预览，支持滚轮缩放和拖拽查看
- 调整边框、底部说明区、字体、字号、位置、颜色
- 提供多套横屏 / 竖屏模板
- 导出 `JPG`
- 导出圆角 `PNG`
- 导出时可限制最长边
- 滑块双击恢复当前模板默认值
- 滑块点击后方向键微调（步长 1）
- 自定义水印图片（签名水印模板，设置持久化）

## 当前模板

- 模板 1：白框（经典横屏 / 竖屏）
- 模板 2：壹印（模糊背景横屏 / 竖屏）
- 模板 3：签名水印（自定义水印图片）
- 模板 4：哈苏水印（品牌风格）
- 模板 5：尼康水印（品牌风格）

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
│  ├─ hasselblad-logo.svg
│  ├─ nikon-logo.svg
│  ├─ template-classic.jpg
│  ├─ template-classic-alt.jpg
│  └─ template-dark.jpg
├─ app.js
├─ main.js
├─ preload.js
├─ index.html
├─ package.json
├─ styles.css
├─ start.bat
└─ README.md
```

## 发布到 GitHub

### 上传仓库

- `index.html`
- `styles.css`
- `app.js`
- `main.js`
- `preload.js`
- `assets/`
- `README.md`
- `start.bat`

### 创建 Release

每次发布都打一个版本号，例如：

- `v1.0.1`
- `v1.0.2`
- `v1.1.0`

可参考仓库内的：

- `GITHUB_RELEASE_GUIDE.md`
- `RELEASE_NOTES_v1.0.1.md`

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
