# Pooplet - 家庭排便记录助手

一个可爱风格的排便记录Web应用，帮助个人追踪排便情况。

## 技术栈

- **前端**: React 19 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS v4
- **动画**: Framer Motion
- **日期处理**: date-fns
- **图标**: Lucide React
- **数据存储**: localStorage (模拟)

## 功能特性

### 首页
- 今日排便统计（次数、分布）
- 本周排便趋势
- 连续记录天数（打卡 streak）
- 排便提醒开关

### 记录功能
- 快速添加排便记录
- 选择时间、难度（顺畅/正常/困难/艰辛）
- 添加备注
- 历史记录查看

### 统计页面
- 连续记录天数
- 本月记录天数
- 总记录数
- 难度分布统计
- 本月日历视图
- 最近一周趋势

## 响应式布局

### PC端（≥768px）
- 左侧固定侧边栏导航
- 右侧主要内容区域
- PayPal风格的现代布局

### 移动端（<768px）
- 顶部导航栏 + 底部Tab导航
- 移动端优先设计
- 侧边栏Drawer菜单

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn基础组件
│   │   └── layout/       # 响应式Layout
│   ├── pages/
│   │   ├── Home.tsx      # 首页
│   │   ├── AddLog.tsx    # 添加记录
│   │   ├── Logs.tsx      # 历史记录
│   │   └── Stats.tsx     # 统计分析
│   ├── hooks/            # 自定义hooks
│   ├── lib/              # 工具函数
│   └── types/            # TypeScript类型
├── index.html
└── package.json
```

## 难度等级

| 等级 | Emoji | 说明 |
|------|-------|------|
| 顺畅 | 💩 | 轻松顺利 |
| 正常 | 😐 | 正常情况 |
| 困难 | 😣 | 有些困难 |
| 艰辛 | 😫 | 非常困难 |

## 注意事项

- 当前使用 localStorage 模拟数据，页面刷新数据会保留
- 提醒功能仅UI展示，实际提醒需要后端配合
- 每个用户独立使用，数据存储在本地
