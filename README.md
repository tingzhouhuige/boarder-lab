<div align="center">

<img src="assets/icon-sizes/app-icon-128.png" width="80" alt="Border Lab 蓝色圆点 Logo">

# Border Lab · 边框实验室

### 把照片装进留白，把拍摄信息留在画面里。

**八套模板 · EXIF 标注 · 批量导出 · 深浅主题**

[![版本](https://img.shields.io/badge/Release-v2.1.1-0a84ff?style=flat-square)](https://github.com/tingzhouhuige/boarder-lab/releases/tag/v2.1.1)
[![平台](https://img.shields.io/badge/Windows-x64-3a3a3c?style=flat-square)](https://github.com/tingzhouhuige/boarder-lab/releases/tag/v2.1.1)
[![在线版](https://img.shields.io/badge/Web-在线使用-27813f?style=flat-square)](https://tingzhouhuige.github.io/boarder-lab/)

[下载 Windows 版](https://github.com/tingzhouhuige/boarder-lab/releases/download/v2.1.1/Border-Lab-2.1.1-Windows-x64.exe) · [在线打开](https://tingzhouhuige.github.io/boarder-lab/) · [本次更新](RELEASE_NOTES_v2.1.1.md)

</div>

![v2.1.1 浅色工作台](docs/images/v2.1.1/workspace-light.png)

边框实验室面向摄影成片：在本地导入照片，选择边框或水印，调整文字与留白，再导出成片。Windows 桌面版与网页版共用编辑逻辑，照片处理在本地完成。

---

## 01 / 这一版，把细节补齐

| 更顺手的编辑 | 更明确的反馈 | 更轻松的上手 |
| --- | --- | --- |
| 连续参数支持 **0.1 步进**，滑块旁可直接输入数字 | 蓝色选中、绿色导入记忆，状态更清楚 | 首次打开提供 **四步引导**，可跳过、可重看 |
| 各模板只展示参与渲染的参数 | 中性灰底，少量蓝、绿、红点缀 | 帮助与主题切换集中在左上工具区 |
| 哈苏、尼康标识前显示 **光圈 / 快门 / ISO** | 壹印默认白色信息，取消日期不再回退文件名 | 右上全屏，窗口操作遵循 Windows 顺序 |

## 02 / 同一张照片，不同的表达

### 留白，也是一种排版

杂志侧栏把照片与相机、镜头、地点分开呈现。文字的大小、字体和位置都能独立调整。

![杂志侧栏](docs/images/v2.1.1/editorial-template.png)

<table>
<tr><td width="50%"><b>纸纹明信片</b><br>纸张材质覆盖照片与白边，强度可调。</td><td width="50%"><b>壹印</b><br>照片延展模糊背景，底部保留拍摄信息。</td></tr>
<tr><td><img src="docs/images/v2.1.1/paper-template.png" alt="纸纹明信片"></td><td><img src="docs/images/v2.1.1/yiyin-template.png" alt="壹印与白色拍摄信息"></td></tr>
</table>

| 模板 | 适合这样使用 |
| --- | --- |
| 白框 | 经典照片说明排版，附标题、日期、镜头与 EXIF |
| 纯白框 | 让照片与留白成为主体，可加照片描边 |
| 纸纹明信片 | 让照片与白边一起呈现纸张质感 |
| 壹印 | 从照片延展背景，让白色信息融入画面 |
| 杂志侧栏 | 一侧照片，一侧相机、镜头与地点 |
| 签名水印 | 导入签名图片，调整位置、大小、透明度与反色 |
| 哈苏水印 | 品牌标识搭配曝光三要素 |
| 尼康水印 | 品牌标识搭配曝光三要素 |

品牌风格模板用于照片排版展示，相关商标归其权利人所有；本项目与品牌无隶属或合作关系。

## 03 / 从文件夹到成片，四步就够

**导入照片 → 选择模板 → 调整参数 → 导出成片**

首次引导逐步高亮操作区域。完成或跳过后不再自动出现；左上角的 **问号** 随时可以重新打开。

![首次使用引导](docs/images/v2.1.1/first-run-guide.png)

### 先选照片，再专心编辑

文件夹浏览器记住上次位置，用绿色标签标出上次导入的照片。大文件夹采用虚拟列表，优先加载当前可见缩略图。

<table>
<tr><td width="50%"><img src="docs/images/v2.1.1/photo-browser.png" alt="文件夹照片浏览"></td><td width="50%"><img src="docs/images/v2.1.1/photo-selection.png" alt="照片多选状态"></td></tr>
<tr><td>浏览文件夹，选择需要处理的照片。</td><td>蓝色边框与勾选标记，一眼确认选择。</td></tr>
</table>

| 操作 | 结果 |
| --- | --- |
| 单击未选照片 | 选中该照片 |
| 再次单击已选照片 | 取消这一张，保留其他已选项 |
| Ctrl / Cmd + 单击 | 多选或取消某一张 |
| Shift + 单击 | 连续选择一段照片 |
| 快速双击 | 直接导入双击的那一张 |
| 双击预览文字 | 原位修改标题、相机或 EXIF 文字 |
| 拖动滑块 / 输入数字 | 微调当前模板参数 |
| Ctrl + Z / Ctrl + Shift + Z | 撤销 / 重做，当前会话最多 100 步 |

## 04 / 白天与夜晚，都让照片站在前面

深浅主题自动记忆。主题改变编辑器界面，成片配色由模板和参数决定。

<table>
<tr><td width="50%"><img src="docs/images/v2.1.1/workspace-dark.png" alt="深色工作台"></td><td width="50%"><img src="docs/images/v2.1.1/photo-browser-dark.png" alt="深色照片选择器"></td></tr>
<tr><td>深色工作台，收敛的界面层次。</td><td>文件夹浏览器也支持深色模式。</td></tr>
</table>

### 导出时，再决定尺寸

支持单张或批量导出 JPG，可设置质量与最长边；圆角成片使用 PNG。多张照片可以保留各自参数，也可通过“同步全部照片”统一调整。

![深色模式导出尺寸设置](docs/images/v2.1.1/export-dark.png)

## 05 / 选择你的使用方式

| Windows 桌面版 | 浏览器版 | 源码 |
| --- | --- | --- |
| [EXE](https://github.com/tingzhouhuige/boarder-lab/releases/download/v2.1.1/Border-Lab-2.1.1-Windows-x64.exe) · [便携 ZIP](https://github.com/tingzhouhuige/boarder-lab/releases/download/v2.1.1/Border-Lab-2.1.1-Windows-x64.zip) | [打开 GitHub Pages](https://tingzhouhuige.github.io/boarder-lab/) | [下载 v2.1.1 源码](https://github.com/tingzhouhuige/boarder-lab/releases/download/v2.1.1/Border-Lab-2.1.1-source.zip) |
| Windows x64，便携运行，无需安装 | 建议桌面 Chrome / Edge，获得完整文件夹体验 | 网页、Electron 源码与构建配置 |

输入格式：**JPG / JPEG / PNG / WebP**。常见 EXIF 读取主要面向 JPEG，缺少的信息可手动编辑。

浏览器文件夹访问依赖授权，必要时需重新选择文件夹；其他浏览器回退普通文件导入。清理网站数据会移除主题、引导记录和相关缓存。

<details>
<summary><b>开发与本地运行</b></summary>

```bash
npm ci
npm start
```

重新生成网页脚本：`npm run build:web`。打包 Windows 便携版：`npm run dist`。

网页通过本地静态 HTTP 服务打开 `index.html`。文件夹授权、Worker 与存储建议在 localhost 或 HTTPS 下使用。

`app.js` 等模块是维护入口，`border-lab.js` 是生成脚本；修改后运行 `npm run build:web`，不要只修改生成文件。首次引导位于 `onboarding.js`。

</details>

<details>
<summary><b>文档与历史版本</b></summary>

- [v2.1.1 更新说明](RELEASE_NOTES_v2.1.1.md)
- [历史更新记录](docs/releases/README.md)
- [发布与构建指南](docs/releasing.md)
- [纸纹资源说明](docs/paper-textures.md)
- [所有正式版本](https://github.com/tingzhouhuige/boarder-lab/releases)

</details>

---

<div align="center">

**Border Lab · Crafted by Xiaohui**

让照片是主角，让工具安静一点。

</div>
