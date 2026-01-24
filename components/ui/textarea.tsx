/**
 * 文本域组件
 *
 * 多行文本输入组件，用于接收较长的用户输入
 * 支持自动调整高度和自定义样式
 * 
 * @path /components/ui/textarea.tsx
 * @author Auto-generated
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
