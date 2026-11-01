# 版权与第三方声明

Border Lab（边框实验室）
Copyright (C) 2026 Xiaohui

本项目以 GNU General Public License v3.0（GPL-3.0）发布，完整条款见 [LICENSE](LICENSE)。在不违反该许可的前提下，你可以使用、研究、修改与再分发本项目。

## 壹印 / Yiyin（风格参考）

- 壹印是一个独立的开源照片水印工具，主仓库为 [ggchivalrous/yiyin](https://github.com/ggchivalrous/yiyin)，采用 GNU GPL v3.0 发布。
- 本项目内置的「壹印」模板是对这一排版思路（照片延展模糊背景、底部细字信息）的**独立实现**：没有复制、链接或修改壹印的源代码、图片、字体与配置文件，也没有把它的代码打包进本仓库或安装包。
- 本项目与壹印的作者及维护者没有任何隶属、赞助或背书关系。「壹印」在此仅作为版式风格的描述性名称，方便用户识别。
- 若权利人或作者认为该命名或实现方式需要调整，请通过仓库 Issue 联系，我们会修改或更名。

## 品牌标识

- Hasselblad、尼康（Nikon）等名称与标识是其各自权利人的商标。
- 本项目仅在「哈苏水印」「尼康水印」两个模板中使用对应标识，用于让用户给自己的照片排版；**不代表**任何形式的合作、授权、赞助或背书，也不得用于冒充官方产品或误导他人。
- 若权利人认为使用方式不妥，请通过 Issue 联系，我们会调整或移除相关素材。

## 字体

- MiSans、Angie Sans Std、Times New Roman、Songti SC 等字体**没有随本项目分发**。
- 程序只按字体名称调用系统已安装的字体；实际显示效果和授权取决于你本机安装的版本，并应遵守对应字体的许可。

## 图像素材

- `assets/paper-cotton-surface.png`、`assets/paper-cotton-surface-2.png` 是专为「纸纹明信片」模板制作的原始纸张素材。
- `assets/template-*.jpg` 为项目自用的示例照片。

## 运行时与构建

- Electron（MIT）、Chromium（BSD-3-Clause 及若干第三方组件）、Node.js（MIT）。
- Windows 包内随附 Electron 与 Chromium 的许可清单（`LICENSE.electron.txt`、`LICENSES.chromium.html`）。
- 打包与安装包生成使用 electron-builder（MIT）。
- 依赖项的完整清单见 `package-lock.json`。
