# GitHub Release 发布版本规则

`package.json` 的 `version` 是唯一版本来源。桌面标题处通过 Electron
`app.getVersion()` 显示该版本，exe 文件名也使用该版本。

发布时先更新 `package.json` 与 `package-lock.json` 中的版本并重新打包，
GitHub Tag 使用 `v` 加相同版本（例如 `v2.1.0`），上传对应的
`Border Lab 2.1.0.exe`。界面显示已安装版本，不从 GitHub 最新版本覆盖。

下面保留旧版发布步骤供参考，版本号应替换为当前 `package.json` 的版本。

## 旧版 v1.0.6 示例

## 建议上传内容

- `index.html`
- `styles.css`
- `app.js`
- `assets/`
- `README.md`
- `RELEASE_NOTES_v1.0.6.md`
- `dist/Border Lab 1.0.6.exe`

## 推荐发布步骤

1. 把项目推送到 GitHub 仓库
2. 在仓库中创建 Tag：`v1.0.6`
3. 打开仓库 `Releases`
4. 点击 `Draft a new release`
5. 选择 `v1.0.6`
6. 标题填写：`边框实验室 v1.0.6`
7. 将 `RELEASE_NOTES_v1.0.6.md` 中内容粘贴到说明区
8. 上传 `Border Lab 1.0.6.exe`
9. 点击发布

## 压缩包建议命名

`Border Lab 1.0.6.exe`

## 适合放入压缩包的文件

```text
index.html
styles.css
app.js
assets/
README.md
RELEASE_NOTES_v1.0.6.md
```
