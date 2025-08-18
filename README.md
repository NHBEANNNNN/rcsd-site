
# 洛克伍德县治安官办公室（RCSO）中文模板（绿色主题）

> 这是一个模仿美国县级治安官官网结构的 **静态网站**，适用于 FiveM RP 服务器。全站中文，绿色配色，可直接部署到 GitHub Pages。

## 页面
- `index.html` 主页：治安官寄语、快捷入口、社区提示
- `news.html` 新闻通告：从 `data/news.json` 读取
- `services.html` 便民服务：在线报案/线索、记录申请、携枪许可（示例）
- `divisions.html` 部门：Patrol / S.R.T. / Traffic / Detentions / Records / Communications
- `jail.html` 拘留所：探视时间、联系、在押信息说明
- `careers.html` 招募：申请条件与路径
- `contact.html` 联系：非紧急电话、邮箱、地址

## 自定义
- Logo：替换 `assets/img/logo.svg`
- 颜色：修改 `assets/css/styles.css` 中的 `--accent` 与 `--accent-2`
- 新闻：编辑 `data/news.json`
- 文案：直接改各页面 HTML

## 部署
把本目录上传到 GitHub 仓库根目录（必须包含 `index.html`），然后在仓库 **Settings → Pages** 开启 `main / (root)`。
