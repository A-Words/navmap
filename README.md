# NavMap

NavMap 是一款基于 `Vite + React + TypeScript + Tauri v2` 的桌面地图应用。当前 v1 采用路线优先的专业清爽界面，地图数据源基于 OpenStreetMap 生态，适合搜索地点、查看地点详情、规划路线和切换地图图层。

## 功能概览

- MapLibre GL 地图画布，使用 OpenStreetMap raster tiles。
- 路线优先工作台：可编辑起点/终点、途经点、路线选项、出行方式、路线摘要、步骤列表。
- Nominatim 地点搜索：用户主动点击 `Search` 后请求，带本地缓存和错误态。
- OSRM 路线规划：用户点击 `Go` 后请求，显示距离、耗时、步骤和路线覆盖层。
- 国际化：首期支持中文和英文，默认中文，可在设置面板切换并自动保存。
- 外观：可在设置中选择跟随系统、亮色或深色模式，地图、面板和控件同步切换。
- 桌面能力：Tauri 应用窗口、应用图标、设置读写命令、定位入口。
- 本地持久化：Tauri 运行时写入应用配置目录；浏览器开发环境回退到 `localStorage`。

## 技术栈

- Frontend: React 18, TypeScript, Vite
- Map: MapLibre GL JS
- Desktop shell: Tauri v2
- Icons: lucide-react
- OSM services:
  - Tiles: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
  - Geocoding: `https://nominatim.openstreetmap.org`
  - Routing: `https://router.project-osrm.org`

## 快速开始

```powershell
npm install
npm run dev
```

开发服务器默认运行在：

```text
http://localhost:1420
```

运行 Tauri 桌面壳：

```powershell
npm run tauri dev
```

生产构建：

```powershell
npm run build
```

Rust/Tauri 检查：

```powershell
cd src-tauri
cargo check
```

## 常用脚本

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | TypeScript 检查并构建前端 |
| `npm run preview` | 预览前端生产构建 |
| `npm run typecheck` | 仅运行 TypeScript 类型检查 |
| `npm run tauri` | 调用 Tauri CLI |

## 项目结构

```text
src/
  components/       React UI 组件
  config/           地图与服务端点配置
  data/             v1 示例路线和初始数据
  services/         Nominatim、OSRM、定位、设置服务
  App.tsx           应用状态和主界面组合
  styles.css        全局视觉系统和布局
src-tauri/
  src/lib.rs        Tauri 命令和应用入口
  capabilities/     Tauri 权限
  icons/            应用图标资源
design-qa.md        已选视觉方案的实现 QA 记录
```

## OSM 使用边界

v1 使用公网 OSM 生态服务用于开发和轻量试用，后续生产化建议替换为自托管或商业服务。

- Nominatim 只在用户主动提交搜索时请求，不做输入即请求的自动补全，不做批量 geocoding。
- Nominatim 请求会根据当前界面语言发送 `Accept-Language`。
- 搜索结果会缓存 12 小时，减少重复请求。
- OSRM demo server 仅用于轻量路线试用，端点集中在 `src/config/mapServices.ts`。
- OSM attribution 必须保留可见。
- 不做瓦片批量预取、离线下载或规避服务策略的缓存。

## 验证记录

当前实现已通过：

- `npm run build`
- `cargo check`
- 1440 x 1024 视觉截图检查
- 核心交互 smoke test：图层切换、搜索提交错误态、路线提交错误态、缩放控件、A/B 点编辑、添加途经点、路线选项
- 外观设置 smoke test：模拟系统深色/亮色偏好切换，并验证跟随系统、亮色、深色三种设置优先级
- `design-qa.md`：`final result: passed`

已知验证限制：

- 在本地 headless 验证环境中，浏览器网络策略可能拦截 Nominatim/OSRM 请求并返回 `Failed to fetch`。应用会展示错误态；真实成功路径依赖运行环境是否允许访问这些公网服务。
- Vite 构建会提示 MapLibre chunk 较大，这是地图库体积导致的非阻塞警告。
- Windows 上 `cargo check` 可能出现增量编译目录清理权限警告，不影响编译结果。
