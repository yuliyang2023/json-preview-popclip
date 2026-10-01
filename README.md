# JSON 美化预览 — PopClip 扩展

选中 JSON 后点击 PopClip 的 `{}` 按钮，在默认浏览器中打开完整的本地美化预览，不写入剪贴板、不替换原文。

## 功能

- 语法高亮、行号、2 / 4 空格缩进，跟随系统深浅色。
- 离线处理，不加载外部资源、不上传 JSON。
- 保留大整数精度、数字原始写法、重复键、键顺序和字符串转义形式。
- 无效 JSON 显示解析错误；支持对象、数组和 JSON 标量，不支持 JSON5、注释或 Markdown 代码围栏。

## 安装和使用

1. 在 [Releases](https://github.com/yuliyang2023/json-preview-popclip/releases/latest) 下载 `JSONPreview.popclipextz`。
2. 确保 macOS 已安装并运行 [PopClip](https://www.popclip.app/)，且已开启辅助功能权限。
3. 双击下载的安装包，在 PopClip 中按提示安装。此自制扩展未使用 PopClip 官方签名；如果显示未签名提示，请确认来源后继续。
4. 选中完整 JSON，点击 `{}` /「JSON 美化预览」，默认浏览器会打开本地页面。

扩展使用 macOS 自带的 `/usr/bin/osascript`、`/usr/bin/open`，安装后无需 Node.js、Python 或其他依赖。PopClip 可能在安装后自动删除压缩包，需要保留时请先备份。

## 本地构建（编译打包）

本项目由 Shell、JXA 和 HTML 组成，无需编译原生二进制；构建步骤是校验配置并生成 PopClip 安装包。开发时需要 Git、Python 3；自动测试另外需要 Node.js 18 或更新版本。

```sh
git clone git@github.com:yuliyang2023/json-preview-popclip.git
cd json-preview-popclip
python3 scripts/build.py
```

产物：`dist/JSONPreview.popclipextz`。构建只包含四个运行时文件，排除 `.DS_Store` 等文件，并使用固定 ZIP 时间戳，便于复现。

本地安装：在 Finder 中双击 `dist/JSONPreview.popclipextz`，或在 macOS 终端执行：

```sh
open dist/JSONPreview.popclipextz
```

也可直接双击源码中的 `JSONPreview.popclipext` 文件夹安装。修改源码后需要重新构建并安装，已安装的扩展不会自动读取源码更改。

## 测试

```sh
node tests/test.mjs
python3 scripts/build.py
```

自动测试覆盖嵌套 JSON、标量、Unicode、大整数、重复键、数字和转义原样保留、错误输入、缩进切换、HTML 安全嵌入、无剪贴板动作配置以及 Shell 语法。在 macOS 上还会实际运行 JXA 渲染器；其他系统跳过这项检查。测试不打开浏览器或安装 PopClip，页面测试使用轻量 DOM 模拟。

实际交互请在 macOS 中完成以下检查：

1. 向剪贴板复制一段标记文字，随后选中下面的 JSON 并触发扩展。
2. 检查中文、大整数、语法高亮、行号及 2 / 4 空格缩进切换。
3. 在其他输入框粘贴，确认剪贴板仍为原来的标记文字，原 JSON 未被替换。
4. 选中 `{"a":}` 触发预览，确认显示解析错误。

```json
{"id":9007199254740993123,"标题":"你好","items":[true,null,{},[]]}
```

## 隐私与临时文件

预览 HTML 包含所选 JSON，保存在 macOS 系统临时目录下独立的 `popclip-json-preview.*` 文件夹（目录权限 700，HTML 权限 600）。关闭浏览器不会立即删除文件；不需要时可删除对应临时文件夹。JSON 不会作为 shell 命令执行，页面不加载外部资源。

## 发布

版本号记录在 `VERSION`。发布前运行测试和构建，将代码提交并推送，创建对应 `v版本号` Git 标签，再在 GitHub Releases 中发布该标签并上传 `dist/JSONPreview.popclipextz`。安装包由源码构建，不纳入 Git 版本控制。

官方规范：[扩展打包](https://www.popclip.app/dev/packages)、[Shell Script 动作](https://www.popclip.app/dev/shell-script-actions)。
