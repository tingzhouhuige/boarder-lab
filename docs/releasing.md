# 构建与发布

版本唯一来源为 `package.json`；当前版本为 2.1.1，Git Tag 为 v2.1.1。

仓库根目录只放运行时代码、`README.md`、`LICENSE`、`NOTICE.md`、`DISCLAIMER.md` 与当前版本的更新说明。构建脚本和回归检查都放在 `tools/`，历史文档在 `docs/`。

## 目录

```text
.
├─ index.html / app.js / border-lab.js / styles.css …   运行时与网页版入口
├─ main.js / preload.js / preferences.cjs               桌面壳与偏好存储
├─ thumbnail-*.cjs                                      桌面缩略图服务
├─ assets/                                              图标、品牌素材、纸纹与示例照片
├─ docs/                                                发布记录、构建指南、纸纹说明、主页截图
└─ tools/                                               构建脚本与回归检查
```

## 开发

1. `npm ci`
2. 修改 `app.js`、`photo-picker.js`、`theme.js` 等模块；首次引导位于 `onboarding.js`。
3. `npm run build:web` 重新生成 `border-lab.js` 与 `version.js`。不要只修改生成文件。
4. `npm start` 启动桌面版；网页版通过 localhost 静态 HTTP 服务测试。
5. `npm run check:syntax` 做一次全仓语法检查。

## 回归检查

`tools/` 下的检查脚本都以仓库根目录为工作目录运行，例如：

```bash
node tools/template-check.cjs
node tools/onboarding-check.cjs
node tools/web-release-check.cjs
```

它们需要 Electron 与已生成的 `border-lab.js`，并把结果写入 `dist/`。`tools/web-check.cjs`、`tools/picker-performance-check.cjs` 会顺带生成截图与性能数据。

## Windows 包

运行 `npm run dist`。`tools/icon-after-pack.cjs` 作为 afterPack 钩子，把 `assets/app-icon.ico` 写入可执行文件；蓝点图标的源图是 `assets/app-icon.png`，各尺寸 PNG 与 ICO 由 `tools/build-icon.cjs` 生成。

## 发布

- 检查版本、模块与生成脚本一致，执行受影响功能的回归检查。
- 根目录保留 `README.md`、`LICENSE`、`NOTICE.md`、`DISCLAIMER.md` 和当前更新说明，旧说明位于 `docs/releases/`。
- 提交源码与主页截图到 main，创建对应版本 Tag。
- Release 附 EXE、便携 ZIP、源码 ZIP 与 SHA256SUMS.txt；源码 ZIP 使用 `git archive` 从发布 Tag 生成。
- GitHub Pages 从 main 根目录发布，推送后确认 Pages 构建成功与线上 `version.js` 的版本。
- `node_modules`、`dist`、`build-cache`、账号配置和环境变量文件不进入仓库或源码包。
- 许可为 GPL-3.0；改动许可、第三方声明或免责说明时，同步检查 `NOTICE.md` 与 `DISCLAIMER.md` 是否仍然准确。
