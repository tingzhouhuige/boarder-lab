# 构建与发布

版本唯一来源为 package.json；当前版本为 2.1.1，Git Tag 为 v2.1.1。

## 开发

1. npm ci
2. 修改 app.js、photo-picker.js、theme.js 等模块；首次引导位于 onboarding.js。
3. npm run build:web 重新生成 border-lab.js 与 version.js。不要只修改生成文件。
4. npm start 启动桌面版。网页版通过 localhost 静态 HTTP 服务测试。

## Windows 包

运行 npm run dist。afterPack 会通过 icon-after-pack.cjs 将 assets/app-icon.ico 写入桌面可执行文件。蓝色圆点图标源位于 assets/app-icon.png；图标尺寸及 ICO 由 build-icon.cjs 生成。

## 发布

- 检查版本、模块与生成脚本一致，执行受影响功能的回归检查。
- 根目录保留 README.md 和当前更新说明，旧说明位于 docs/releases/。
- 提交源码与主页截图到 main，创建对应版本 Tag。
- Release 附 EXE、便携 ZIP、源码 ZIP 与 SHA256SUMS.txt；源码 ZIP 使用 git archive 从发布 Tag 生成。
- GitHub Pages 当前从 main 根目录发布，推送后确认 Pages 构建成功与线上 version.js 的版本。
- node_modules、dist、build-cache、账号配置和环境变量文件不进入仓库或源码包。
