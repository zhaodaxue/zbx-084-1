# 乡镇供水站水质监测系统

一个用于可视化乡镇供水站浊度与 pH 数据的 Web 应用，帮助站长快速识别异常日期。

## 功能特性

- 📊 **CSV 数据导入**：支持拖拽上传 CSV 文件，自动跳过缺少 date 字段的行
- 📅 **日历热力图**：绿色表示正常，橙色表示异常，一眼识别异常日期
- 🏘️ **多站点支持**：支持多个供水站点的数据管理和切换查看
- 🔍 **日期明细**：点击任意日期查看当日所有原始记录明细
- 📈 **统计面板**：显示监测天数、异常天数、正常天数、异常率等统计数据
- 🐳 **Docker 部署**：一键启动，无需复杂配置

## 技术栈

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS + Zustand
- **后端**：Express 4 + TypeScript + SQLite
- **容器化**：Docker + Docker Compose

## 数据格式

CSV 文件需包含以下列：
- `date` - 日期 (YYYY-MM-DD)
- `station_id` - 站点ID
- `turbidity_ntu` - 浊度值 (NTU)
- `ph` - pH 值

### 样例数据

项目已包含样例数据文件：[sample-data/sample.csv](sample-data/sample.csv)

## 异常判定规则

每日按站点聚合后：
- 浊度最大值 > 1.0 NTU 记为异常
- pH 与 7.0 的偏差绝对值 > 0.5 记为异常
- 满足任一条件即为异常日

## 快速开始

### 使用 Docker Compose（推荐）

```bash
# 启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 停止服务
docker-compose down
```

启动后访问：http://localhost:8080

### 本地开发

#### 后端开发

```bash
cd backend
npm install
npm run dev
```

后端服务运行在 http://localhost:3001

#### 前端开发

```bash
cd frontend
npm install
npm run dev
```

前端服务运行在 http://localhost:5173

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/import` | 上传并导入 CSV 数据 |
| GET | `/api/stations` | 获取所有站点列表 |
| GET | `/api/daily-summary` | 获取按日聚合的异常数据 |
| GET | `/api/day-detail` | 获取某日的原始明细数据 |
| GET | `/api/station-stats` | 获取站点统计数据 |
| GET | `/api/sample.csv` | 下载样例 CSV |
| GET | `/api/health` | 健康检查 |

## 项目结构

```
.
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── controllers/     # API 控制器
│   │   ├── services/        # 业务逻辑
│   │   ├── models/          # 数据模型
│   │   ├── types/           # TypeScript 类型
│   │   ├── utils/           # 工具函数
│   │   └── server.ts        # 服务入口
│   ├── Dockerfile
│   └── package.json
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── components/      # React 组件
│   │   ├── store/           # Zustand 状态管理
│   │   ├── utils/           # 工具函数
│   │   ├── types/           # TypeScript 类型
│   │   ├── App.tsx          # 主应用组件
│   │   └── main.tsx         # 入口文件
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── sample-data/             # 样例数据
│   └── sample.csv
├── data/                    # SQLite 数据库文件（运行时创建）
├── docker-compose.yml
└── README.md
```

## 数据存储

使用 SQLite 数据库，数据文件存储在 `./data/water.db`，通过 Docker volume 持久化。

## 许可证

MIT
