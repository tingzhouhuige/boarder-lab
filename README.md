# 边框实验室

边框实验室是一个可直接在浏览器打开的静态网页工具，用于为照片添加白边、读取常见 EXIF 信息，并导出带标注信息的 JPG 成片。

## 功能

- 导入 `JPG / JPEG / PNG / WebP`
- 读取常见 JPEG EXIF 信息
- 自动追加拍摄日期、镜头信息
- 调整白边、底部说明区、文字大小、位置、字体、颜色
- 实时预览成片效果
- 导出 JPG，并尽量保留原始 JPEG 的 EXIF 信息

## 项目结构

```text
.
├─ assets/
│  └─ template-classic.jpg
├─ app.js
├─ index.html
├─ styles.css
└─ README.md
```

## 本地使用

直接打开 `index.html` 即可使用。

如果浏览器支持 `showSaveFilePicker`，导出时可以手动选择保存位置和文件名；默认文件名与原图一致，仅扩展名为 `.jpg`。

## 上传到 GitHub

1. 在 GitHub 创建一个新仓库
2. 把本项目全部文件上传到仓库根目录
3. 提交后即可作为静态网页项目保存

## 启用 GitHub Pages

1. 打开仓库的 `Settings`
2. 进入 `Pages`
3. 在 `Build and deployment` 中选择 `Deploy from a branch`
4. 选择主分支和根目录 `/`
5. 保存后等待 GitHub 生成访问链接

## 说明

- 模板缩略图资源已放在项目内的 `assets/` 目录，适合直接上传 GitHub
- `MiSans`、`Angie Sans Std` 等字体只有在系统已安装时才会生效
- PNG / WebP 通常不含标准 EXIF，能加边框，但不一定能读取拍摄信息
