# v2 使用与交付说明

已核对：`英文-27` 是 PROG2002 A2 的 Driftline 海岸公益活动项目，A3 明确要求继续使用 A2 案例。原项目源码未改，新增内容都在 `v2`。

2026-10-13 已将 2.0.1 部署到两个 SCU 账号，并分别验证公网健康检查、实际报名、重复拦截、筛选与后台保存：

- `kji10`：前台 <https://24832245.it.scu.edu.au/driftline-a3/>，后台 <https://24832245.it.scu.edu.au/driftline-a3/admin/>，见 [部署验收记录](docs/scu-deployment-2026-10-13.md)。
- `syang35`：前台 <https://24833002.it.scu.edu.au/driftline-a3/>，后台 <https://24833002.it.scu.edu.au/driftline-a3/admin/>，见 [部署验收记录](docs/scu-syang35-2026-10-13.md)。

## 已完成

- MySQL 报名表：活动外键、活动与邮箱唯一约束、时间、联系方式、票数和票价记录；单个 SQL 包含结构及 12 条示例报名。
- 前台首页、组合筛选、活动详情、报名表和确认；报名记录按最新时间排列。
- 后台全部状态列表、新增、编辑、报名查看、删除保护和分类管理。
- 前后台均使用 AngularJS 1.8.3，活动详情调用 Open-Meteo 显示实际天气预报。
- 14 项接口测试通过，含 Passenger 与 URL 前缀回归；此前本机桌面和 390×844 手机布局记录见 local-verification.md。

界面沿用 A2 的海岸摄影、深青色和珊瑚色，文案以具体活动和表单动作为主。没有编造支付成功、团队贡献或上线结果。

## 本机预览

本次验收地址：<http://localhost:3027/>，后台：<http://localhost:3027/admin/>。

本次使用单独的临时 MySQL 实例，监听 `127.0.0.1:33127`；没有启动或修改原有 MySQL84 服务。本机连接在 `api/.env`，不会进入 Git 或交付 ZIP。临时数据库路径记录在 `.qa/mysql-path.txt`，只供本机排查。

如果电脑重启或服务停止，按 README 配置运行中的 MySQL，导入 `api/schema.sql`，再执行 `scripts/preview.ps1`。不要把本机临时连接直接当成 cPanel 配置。

## 交付文件

`delivery` 中保留两个账号的文件：`kji10A3-clientside.zip`、`kji10A3-adminside.zip`、`kji10A3-api.zip`，以及 `syang35A3-clientside.zip`、`syang35A3-adminside.zip`、`syang35A3-api.zip`。后者使用 `--runtime-only`，只打包应用运行文件，共 47 个条目。

此前保留的 `username` 包仍在本机，本次新增以实际账号命名的交付包。PDF 虽写“2 zip files”，但列出了三个文件名，因此按三个包准备。全部解压到同一目录后，得到并列的三个应用文件夹。

`delivery/schema.sql` 是便于单独导入的同一份 SQL。`manifest.json` 保留 kji10 的文件清单；`syang35A3-manifest.json` 单独记录 syang35 包内文件及 SHA-256。两个账号均已部署；未上传 Blackboard 或推送 GitHub。

## 仍需本人和队友完成

- kji10 和 syang35 的部署已完成；本人仍需核对各自课程提交链接与演示要求。
- 使用导师可访问的私有 GitHub 项目，提交你们真实完成的工作。本次本地 Git 提交不能充当过去的双人协作记录。
- 录制不超过 15 分钟的视频，解释代码与个人实际贡献，上传自己的 SCU OneDrive。
- 各自填写互评表，按 brief 的邮件标题私下发给 tutor。`requirements` 两份原表未代填；表内 A2 标题与 A3 brief 不一致，请核对课程的 A3 表。
- 补充真实姓名、学号、组号、链接和准确的 GenAI 声明，再检查 Blackboard 当前要求。

评分项与证据见 `docs/rubric-checklist.md`。仅凭本地代码不能保证满分。

## 写作风格与课程规则

本次使用说人话和前端设计技能清理空泛文案、模板布局和不必要的装饰，不隐瞒生成来源。A3 brief 第 8–9 页只允许特定辅助用途，明确禁止把生成代码或报告直接复制到提交作品中。

这份代码和技术说明属于 AI 辅助参考成果，不能标成“本人独立编写”或“未使用 AI”。改语气、变量名或界面风格不会改变这一点。请按课程要求完成自己的实现和说明，必要时让 Unit Assessor 确认允许范围。实际使用情况见 `docs/AI-use.md`。
