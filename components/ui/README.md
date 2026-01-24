# UI 组件库

本目录包含可复用的基础 UI 组件，遵循现代 React 和 TypeScript 最佳实践。

## 组件列表

### Button (按钮)

**文件位置：** `ui/button.tsx`

**功能：** 可定制样式的按钮组件，支持多种变体和尺寸。

**技术特点：**
- 使用 `class-variance-authority` 管理样式变体
- 支持 `asChild` 属性，可将按钮样式应用到其他元素
- 使用 `React.forwardRef` 支持引用转发
- 使用 Radix UI 的 Slot 组件实现多态

**Props 类型：**
```typescript
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}
```

**变体 (variant)：**
- `default` - 默认主色调按钮
- `destructive` - 危险操作按钮
- `outline` - 轮廓按钮
- `secondary` - 次要按钮
- `ghost` - 幽灵按钮
- `link` - 链接样式按钮

**尺寸 (size)：**
- `default` - 默认高度 h-11，宽度 px-7
- `sm` - 小尺寸 h-10，宽度 px-6
- `lg` - 大尺寸 h-13，宽度 px-9
- `icon` - 图标按钮 h-11 w-11

**使用示例：**
```typescript
import { Button } from "@/components/ui/button";

// 基本使用
<Button>提交</Button>

// 不同变体
<Button variant="destructive">删除</Button>
<Button variant="outline">取消</Button>

// 不同尺寸
<Button size="sm">小按钮</Button>
<Button size="lg">大按钮</Button>

// 作为子元素使用
<Button asChild>
  <a href="/link">链接按钮</a>
</Button>
```

---

### Card (卡片)

**文件位置：** `ui/card.tsx`

**功能：** 容器组件，用于组织内容。

**技术特点：**
- 使用 `React.forwardRef` 支持引用转发
- 支持 `asChild` 属性
- 预设圆角、边框、阴影样式

**Props 类型：**
```typescript
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}
```

**使用示例：**
```typescript
import { Card } from "@/components/ui/card";

<Card>
  <h2>标题</h2>
  <p>内容</p>
</Card>

// 自定义样式
<Card className="p-6 bg-blue-50">
  <div>自定义样式卡片</div>
</Card>
```

---

### Label (标签)

**文件位置：** `ui/label.tsx`

**功能：** 表单标签组件，用于关联输入框。

**技术特点：**
- 使用 `React.forwardRef` 支持引用转发
- 支持禁用状态的样式
- 小号字体，中等粗细

**Props 类型：**
```typescript
export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;
```

**使用示例：**
```typescript
import { Label } from "@/components/ui/label";

<Label htmlFor="email">邮箱</Label>
<Input id="email" type="email" />
```

---

### Badge (徽章)

**文件位置：** `ui/badge.tsx`

**功能：** 小型状态标识组件。

**技术特点：**
- 使用 `class-variance-authority` 管理变体
- 圆角样式，小号字体
- 支持焦点状态和动画效果

**Props 类型：**
```typescript
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}
```

**变体 (variant)：**
- `default` - 主色调背景
- `secondary` - 次要色背景
- `destructive` - 危险操作色背景
- `outline` - 轮廓样式

**使用示例：**
```typescript
import { Badge } from "@/components/ui/badge";

<Badge>默认</Badge>
<Badge variant="secondary">次要</Badge>
<Badge variant="destructive">警告</Badge>
<Badge variant="outline">轮廓</Badge>
```

---

### Table (表格)

**文件位置：** `ui/table.tsx`

**功能：** 数据表格组件，包含多个子组件。

**技术特点：**
- 复合组件模式
- 所有子组件使用 `React.forwardRef`
- 响应式设计（自动横向滚动）
- 支持悬停和选中状态

**组件列表：**
- `Table` - 表格容器
- `TableHeader` - 表头
- `TableBody` - 表格主体
- `TableFooter` - 表格底部
- `TableRow` - 表格行
- `TableHead` - 表头单元格
- `TableCell` - 表格单元格
- `TableCaption` - 表格说明文字

**使用示例：**
```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>姓名</TableHead>
      <TableHead>年龄</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>张三</TableCell>
      <TableCell>25</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

### Input (输入框)

**文件位置：** `ui/input.tsx`

**功能：** 文本输入框组件。

**技术特点：**
- 使用 `React.forwardRef` 支持引用转发
- 支持所有 HTML input 属性
- 预设焦点和禁用状态样式
- 支持文件上传样式

**Props 类型：**
```typescript
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>
```

**使用示例：**
```typescript
import { Input } from "@/components/ui/input";

// 基本使用
<Input type="text" placeholder="请输入用户名" />

// 不同类型
<Input type="email" placeholder="邮箱" />
<Input type="password" placeholder="密码" />
<Input type="number" min="1" max="100" />

// 带默认值
<Input defaultValue="默认值" />
```

---

### Textarea (文本域)

**文件位置：** `ui/textarea.tsx`

**功能：** 多行文本输入组件。

**技术特点：**
- 使用 `React.forwardRef` 支持引用转发
- 最小高度 80px
- 支持自动调整高度
- 预设焦点和禁用状态样式

**Props 类型：**
```typescript
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
```

**使用示例：**
```typescript
import { Textarea } from "@/components/ui/textarea";

<Textarea placeholder="请输入备注" rows={4} />
<Textarea defaultValue="已输入内容" disabled />
```

---

### Form (表单)

**文件位置：** `ui/form.tsx`

**功能：** 表单容器组件。

**技术特点：**
- 使用 `React.forwardRef` 支持引用转发
- 默认垂直间距布局
- 支持所有 HTML form 属性

**Props 类型：**
```typescript
export type FormProps = React.FormHTMLAttributes<HTMLFormElement>;
```

**使用示例：**
```typescript
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

<Form onSubmit={handleSubmit}>
  <Input name="username" placeholder="用户名" />
  <Button type="submit">提交</Button>
</Form>
```

---

## 设计模式

### 1. 引用转发模式

所有组件都使用 `React.forwardRef`，允许父组件访问 DOM 元素。

```typescript
const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(...)} {...props} />
  )
);
```

### 2. 样式合并模式

使用 `cn()` 工具函数合并 Tailwind 类名，支持条件样式。

```typescript
className={cn("base-classes", className)}
```

### 3. 类型扩展模式

所有组件 Props 都扩展自原生 HTML 元素类型，保持完整的类型安全。

```typescript
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // 自定义属性
}
```

### 4. 变体管理模式

使用 `class-variance-authority` 管理组件的不同样式变体。

```typescript
const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", destructive: "..." },
    size: { default: "...", sm: "..." }
  }
});
```

---

## 工具函数

### cn()

样式类名合并工具，支持条件样式和 Tailwind 类名去重。

```typescript
import { cn } from "@/lib/utils";

cn("bg-white", isActive && "bg-blue-500", className)
```

---

## 依赖关系

```
@/lib/utils
  └── cn() - 样式合并工具

@radix-ui/react-slot
  └── Slot - 多态组件支持

class-variance-authority
  └── cva() - 变体管理
```

---

## 最佳实践

1. **类型安全** - 始终使用 TypeScript 定义 Props
2. **引用转发** - 所有可交互组件都应支持 ref
3. **样式合并** - 使用 cn() 函数处理 className
4. **无障碍** - 遵循 ARIA 标准
5. **一致性** - 保持组件 API 的一致性
6. **可组合性** - 支持通过 children 组合使用

---

## 扩展指南

### 添加新变体

1. 在 `buttonVariants` 或 `badgeVariants` 中添加新变体
2. 更新 TypeScript 类型定义
3. 添加使用示例

### 创建新组件

1. 创建 `.tsx` 文件
2. 使用 TypeScript 定义 Props 接口
3. 使用 `React.forwardRef` 包装组件
4. 通过 `cn()` 合并样式类名
5. 导出组件和类型
6. 添加 displayName

### 示例模板

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  // 自定义属性
}

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("base-classes", className)}
      {...props}
    />
  )
);
Component.displayName = "Component";

export { Component }
```
