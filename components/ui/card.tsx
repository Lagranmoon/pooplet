/**
 * 卡片组件
 *
 * 基于 React forwardRef 的可复用卡片容器组件
 * 用于包裹内容并提供统一的样式容器
 * 
 * @path /components/ui/card.tsx
 * @author Auto-generated
 */

import * as React from "react"
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";
