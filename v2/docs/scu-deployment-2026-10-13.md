# SCU 部署验收记录

日期：2026-10-13。部署账号：`kji10`。使用用户原有 Chrome 的 cPanel 标签页重新登录，核实 Current User 后执行部署。

## 上线地址与版本

- 前台：<https://24832245.it.scu.edu.au/driftline-a3/>
- 管理后台：<https://24832245.it.scu.edu.au/driftline-a3/admin/>
- 健康检查：<https://24832245.it.scu.edu.au/driftline-a3/api/health>
- 实际响应：`{"status":"ok","version":"2.0.1"}`。通过 cPanel 终端向该公网 HTTPS 地址请求确认。

Node.js 18.20.8；MySQL 5.7.44-cll-lve；应用目录 `/home/kji10/driftline-a3/api`；启动文件 `passenger.js`；数据库 `kji10_driftline_a3`；`APP_BASE_PATH=/driftline-a3`。数据库配置存放在非公开应用目录，`.env` 权限为 `0600`。凭据不进入 Git、交付包或本记录。

## 本次修正

- 对齐托管环境的 Node.js 最低版本要求，健康检查与交付清单从 package.json 读取版本。
- 在同一 SQL 中为 MySQL 8.0.16+ 保留 CHECK 约束，支持 SCU MySQL 5.7 的导入；5.7 的票数和金额由 API 校验，外键与唯一约束仍生效。
- 增加 Passenger 入口，解决入口被 require 加载时没有启动服务的问题。
- 根据实际公网请求处理 SCU 保留的 URL 前缀，并兼容代理已经移除前缀的情况。

## 实际验收

| 检查 | 本次结果 |
| --- | --- |
| 数据库导入 | 4 个表、10 个活动、12 条示例报名、4 个分类 |
| 公网首页 | 显示数据库活动，下一场为 2026-10-16 的 North Bondi Beach Clean-up |
| 组合筛选 | 日期 2026-10-16、地点 Bondi、Beach clean-up，仅返回 1 个活动 |
| 活动详情 | 显示按最新时间排列的报名记录，公开页面不显示联系方式 |
| 天气 | Bondi 活动实际显示 Open-Meteo 预报 |
| 新报名 | 虚构信息提交成功，确认号 DL-13，1 张免费票 |
| 重复报名 | 同一邮箱再次提交被拒绝，没有第二条报名 |
| 后台状态 | 10 个活动，8 Active、1 Past、1 Suspended；Bondi 为 4 条报名、7 张票 |
| 后台保存 | Paused planning session 原值保存成功，仍为 Suspended |
| 分类页面 | 4 个分类全部从 API 加载 |
| 本机接口测试 | 官方 Node.js 18.20.8 + 独立 MySQL 8 数据库，14 项通过，含 Passenger 导入与前缀回归 |

保留 1 条明确标识为 Deployment Verification 的虚构验收报名，ID 为 13，邮箱为 `deploy-kji10-20261013@example.com`，金额为 0。最终网站数据库有 10 个活动、13 条报名。没有删除原有示例记录。

后台新增、删除及删除保护由本机接口测试覆盖；本次没有在公网执行删除操作。手机布局保留此前本机验收记录，本次没有调整用户 Chrome 的视口。不得把这些本机结果标成全部已在 SCU 实测。

验收截图保存在本机 `.qa/scu-deployment/`，不进入交付包。原版 A2 跟踪文件保持不变，原有三个 SCU 课程数据库和站点文件保留。本次仅验证 kji10 账号；其他组员账号、GitHub 推送、视频、Blackboard 与互评提交未执行。
