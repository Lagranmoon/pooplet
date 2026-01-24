# Stats API

统计分析 API，提供记录的各种统计信息和数据分析。

## 目录说明

`app/api/stats/` 目录存放统计分析的 API Routes。

## 目录结构

```
app/api/stats/
├── daily/           # 每日统计
│   └── route.ts
├── frequency/       # 频率统计
│   └── route.ts
├── overview/        # 总览统计
│   └── route.ts
└── quality/         # 质量分布
    └── route.ts
```

## API 端点

### 1. GET /api/stats/overview

**功能：** 获取记录总览统计

**请求：**
```http
GET /api/stats/overview?period=7
```

**查询参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `period` | number | 否 | 7 | 统计周期（天数） |

**响应：**
```json
{
  "success": true,
  "data": {
    "totalRecords": 150,
    "avgDailyCount": 2.14,
    "mostCommonQuality": 5,
    "averageQuality": 4.8,
    "streakDays": 30,
    "lastRecordAt": "2024-01-15T10:30:00Z",
    "firstRecordAt": "2023-12-16T10:30:00Z",
    "frequencyData": [
      {
        "date": "2024-01-15T00:00:00Z",
        "count": 3
      }
    ],
    "qualityTrend": [
      {
        "date": "2024-01-15T00:00:00Z",
        "avgQuality": 4.5
      }
    ],
    "qualityDistribution": [
      {
        "qualityRating": 5,
        "count": 45
      }
    ]
  }
}
```

**实现：**
```typescript
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "未认证" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = parseInt(searchParams.get("period") || "7");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  // 并行查询所有统计数据
  const [totalRecords, qualityStats, frequencyData, qualityTrend] = await Promise.all([
    prisma.record.count({
      where: {
        userId: session.user.id,
        occurredAt: { gte: startDate }
      }
    }),
    prisma.record.groupBy({
      by: ["qualityRating"],
      where: {
        userId: session.user.id,
        occurredAt: { gte: startDate }
      },
      _count: true,
    }),
    prisma.$queryRaw`
      SELECT DATE(occurred_at) as date, COUNT(*) as count
      FROM pooplet_record
      WHERE user_id = ${session.user.id}
        AND DATE(occurred_at) >= ${startDate}
      GROUP BY DATE(occurred_at)
      ORDER BY date ASC
    `,
    prisma.$queryRaw`
      SELECT DATE(occurred_at) as date, AVG(quality_rating) as avg_quality
      FROM pooplet_record
      WHERE user_id = ${session.user.id}
        AND DATE(occurred_at) >= ${startDate}
      GROUP BY DATE(occurred_at)
      ORDER BY date ASC
    `
  ]);

  const mostCommonQuality = qualityStats[0]?.qualityRating || null;
  const avgQuality = qualityStats.reduce((sum, s) => sum + s.qualityRating * s._count, 0) / totalRecords || 0;

  return NextResponse.json({
    success: true,
    data: {
      totalRecords,
      avgDailyCount: totalRecords / period,
      mostCommonQuality,
      averageQuality: Math.round(avgQuality * 100) / 100,
      streakDays: period,
      frequencyData,
      qualityTrend,
      qualityDistribution: qualityStats,
    },
  });
}
```

**使用场景：**
- 仪表板首页统计卡片
- 综合健康报告
- 数据可视化

---

### 2. GET /api/stats/daily

**功能：** 获取每日详细统计

**请求：**
```http
GET /api/stats/daily?days=30
```

**查询参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `days` | number | 否 | 30 | 统计天数 |

**响应：**
```json
{
  "success": true,
  "data": {
    "dailyStats": [
      {
        "date": "2024-01-15",
        "count": 3,
        "avgQuality": 4.5,
        "minQuality": 3,
        "maxQuality": 7
      }
    ],
    "summary": {
      "totalDays": 30,
      "totalRecords": 90,
      "avgDaily": 3,
      "maxDaily": 5,
      "minDaily": 1
    }
  }
}
```

**实现：**
```typescript
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "未认证" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const dailyStats = await prisma.$queryRaw`
    SELECT DATE(occurred_at) as day,
           COUNT(*) as count,
           AVG(quality_rating) as avg_quality,
           MIN(quality_rating) as min_quality,
           MAX(quality_rating) as max_quality
    FROM pooplet_record
    WHERE user_id = ${session.user.id}
      AND occurred_at >= ${startDate}
    GROUP BY DATE(occurred_at)
    ORDER BY day ASC;
  `;

  const summary = {
    totalDays: dailyStats.length,
    totalRecords: dailyStats.reduce((sum, s) => sum + Number(s.count), 0),
    avgDaily: 0,
    maxDaily: 0,
    minDaily: 0,
  };

  if (summary.totalDays > 0) {
    summary.avgDaily = summary.totalRecords / summary.totalDays;
    summary.maxDaily = Math.max(...dailyStats.map((s) => Number(s.count)));
    summary.minDaily = Math.min(...dailyStats.map((s) => Number(s.count)));
  }

  return NextResponse.json({
    success: true,
    data: {
      dailyStats: dailyStats.map((s) => ({
        date: s.day.toLocaleDateString("zh-CN"),
        count: Number(s.count),
        avgQuality: s.avg_quality,
        minQuality: s.min_quality,
        maxQuality: s.max_quality,
      })),
      summary,
    },
  });
}
```

**使用场景：**
- 详细每日记录分析
- 趋势分析图表
- 健康报告生成

---

### 3. GET /api/stats/frequency

**功能：** 获取排便频率统计

**请求：**
```http
GET /api/stats/frequency
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15T00:00:00Z",
      "count": 3,
      "avg_quality": 4.5
    }
  ]
}
```

**实现：**
```typescript
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "未认证" }, { status: 401 });
  }

  try {
    const result = await prisma.$queryRaw`
      SELECT DATE(occurred_at) as date,
             COUNT(*) as count,
             AVG(quality_rating) as avg_quality
      FROM pooplet_record
      WHERE user_id = ${session.user.id}
        AND DATE(occurred_at) >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(occurred_at)
      ORDER BY date DESC;
    `;

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '获取频率数据失败',
    }, { status: 500 });
  }
}
```

**使用场景：**
- 排便频率图表
- 趋势分析
- 异常检测

---

### 4. GET /api/stats/quality

**功能：** 获取质量分布统计

**请求：**
```http
GET /api/stats/quality
```

**响应：**
```json
{
  "success": true,
  "data": {
    "distribution": {
      "1": 5,
      "2": 10,
      "3": 15,
      "4": 30,
      "5": 45,
      "6": 35,
      "7": 10
    },
    "totalRecords": 150,
    "mostCommon": 5
  }
}
```

**实现：**
```typescript
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "未认证" }, { status: 401 });
  }

  try {
    const qualityStats = await prisma.record.groupBy({
      by: ["qualityRating"],
      _count: true,
      where: { userId: session.user.id },
    });

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
    } as Record<1 | 2 | 3 | 4 | 5 | 6 | 7, number>;

    qualityStats.forEach((stat) => {
      distribution[stat.qualityRating] = stat._count;
    });

    const totalRecords = qualityStats.reduce((sum, s) => sum + s._count, 0);

    const mostCommon = parseInt(
      Object.entries(distribution).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
    );

    return NextResponse.json({
      success: true,
      data: {
        distribution,
        totalRecords,
        mostCommon,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '获取质量分布数据失败',
    }, { status: 500 });
  }
}
```

**使用场景：**
- 质量分布饼图
- 健康评估
- 质量改善建议

## 统计指标说明

### 总览指标

| 指标 | 类型 | 说明 |
|------|------|------|
| `totalRecords` | number | 总记录数 |
| `avgDailyCount` | number | 日均排便次数 |
| `mostCommonQuality` | number | 最常见的质量评级 |
| `averageQuality` | number | 平均质量评级 |
| `streakDays` | number | 统计周期（天数） |
| `lastRecordAt` | datetime | 最后一条记录时间 |
| `firstRecordAt` | datetime | 第一条记录时间 |

### 每日统计

| 指标 | 类型 | 说明 |
|------|------|------|
| `count` | number | 当天记录数 |
| `avgQuality` | number | 当天平均质量 |
| `minQuality` | number | 当天最低质量 |
| `maxQuality` | number | 当天最高质量 |

### 频率统计

| 指标 | 类型 | 说明 |
|------|------|------|
| `date` | date | 日期 |
| `count` | number | 当天记录数 |
| `avg_quality` | number | 当天平均质量 |

### 质量分布

| 指标 | 类型 | 说明 |
|------|------|------|
| `distribution` | object | 各质量等级的记录数 |
| `totalRecords` | number | 总记录数 |
| `mostCommon` | number | 最常见的质量等级 |

## 数据查询优化

### 1. 使用原始 SQL
```typescript
await prisma.$queryRaw`
  SELECT DATE(occurred_at) as day, COUNT(*) as count
  FROM pooplet_record
  WHERE user_id = ${userId}
  GROUP BY DATE(occurred_at)
`;
```

**优势：**
- 更高效的聚合查询
- 减少数据传输
- 数据库端处理

### 2. 并行查询
```typescript
const [totalRecords, qualityStats, frequencyData] = await Promise.all([
  prisma.record.count({ where }),
  prisma.record.groupBy({ by: ["qualityRating"], where, _count: true }),
  prisma.$queryRaw`SELECT ...`,
]);
```

**优势：**
- 减少总查询时间
- 充分利用数据库连接池

### 3. 数据库索引
```prisma
model Record {
  id            String   @id @default(cuid())
  userId        String   @index
  occurredAt    DateTime @index
  qualityRating Int      @index
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId, occurredAt])
  @@index([userId, qualityRating])
}
```

## 图表数据格式

### 折线图
```typescript
interface LineChartData {
  date: string;
  count: number;
}
```

### 柱状图
```typescript
interface BarChartData {
  date: string;
  avgQuality: number;
}
```

### 饼图
```typescript
interface PieChartData {
  name: string;    // "很差", "较差", ...
  value: number;   // 记录数
}
```

## 使用示例

### 获取总览统计
```typescript
const response = await fetch('/api/stats/overview?period=7');
const data = await response.json();

if (data.success) {
  console.log('总记录数:', data.data.totalRecords);
  console.log('日均次数:', data.data.avgDailyCount);
  console.log('平均质量:', data.data.averageQuality);
}
```

### 获取每日统计
```typescript
const response = await fetch('/api/stats/daily?days=30');
const data = await response.json();

if (data.success) {
  console.log('每日统计:', data.data.dailyStats);
  console.log('汇总:', data.data.summary);
}
```

### 获取质量分布
```typescript
const response = await fetch('/api/stats/quality');
const data = await response.json();

if (data.success) {
  console.log('质量分布:', data.data.distribution);
  console.log('最常见:', data.data.mostCommon);
}
```

## 前端集成

### Recharts 示例

#### 折线图
```typescript
<LineChart data={frequencyData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), "M/d")} />
  <YAxis />
  <Tooltip labelFormatter={(value) => format(new Date(value as string), "M月d日")} />
  <Line type="monotone" dataKey="count" stroke="#3b82f6" />
</LineChart>
```

#### 饼图
```typescript
<PieChart>
  <Pie
    data={qualityDistribution}
    cx="50%"
    cy="50%"
    labelLine={false}
    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
    outerRadius={100}
    fill="#8884d8"
    dataKey="value"
  >
    {qualityDistribution.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    ))}
  </Pie>
</PieChart>
```

#### 柱状图
```typescript
<BarChart data={qualityTrend}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), "M/d")} />
  <YAxis domain={[1, 7]} />
  <Tooltip
    labelFormatter={(value) => format(new Date(value as string), "M月d日")}
    formatter={(value: number) => [
      ["很差", "较差", "一般", "还好", "良好", "很好", "完美"][value - 1] || value,
      "质量"
    ]}
  />
  <Bar dataKey="avgQuality" fill="#22c55e" />
</BarChart>
```

## 性能优化

### 1. 缓存策略
```typescript
import { unstable_cache } from "next/cache";

const getStats = unstable_cache(
  async (userId: string) => {
    // 查询逻辑
  },
  ["stats", userId],
  { revalidate: 300 } // 5 分钟
);
```

### 2. 分页加载
```typescript
const response = await fetch(`/api/stats/daily?days=30&offset=0`);
const moreResponse = await fetch(`/api/stats/daily?days=30&offset=30`);
```

### 3. 增量更新
```typescript
// 只查询最近更新的数据
const lastUpdated = new Date(lastSyncTime);
const newRecords = await prisma.record.findMany({
  where: {
    userId: session.user.id,
    updatedAt: { gte: lastUpdated }
  }
});
```

## 错误处理

### 错误响应格式
```json
{
  "success": false,
  "error": "错误描述"
}
```

### 常见错误

| 错误 | HTTP 状态 | 说明 |
|------|-----------|------|
| "未认证" | 401 | 用户未登录 |
| "获取频率数据失败" | 500 | 数据库查询失败 |
| "获取质量分布数据失败" | 500 | 数据库查询失败 |

## 测试

### 单元测试
```typescript
describe('Stats API', () => {
  it('should get overview stats', async () => {
    const response = await fetch('/api/stats/overview?period=7');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.totalRecords).toBeDefined();
  });

  it('should get daily stats', async () => {
    const response = await fetch('/api/stats/daily?days=30');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.dailyStats).toBeInstanceOf(Array);
  });
});
```

## 未来扩展

- 添加时间段对比统计（本周 vs 上周）
- 添加健康评分计算
- 添加趋势预测
- 添加异常检测
- 添加健康建议生成
- 添加导出功能（PDF 报告）
- 添加数据对比功能
- 添加自定义统计周期
