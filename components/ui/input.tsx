/**
 * 输入框组件
 *
 * 通用单行文本输入组件
 * 支持多种输入类型和自定义样式
 * 
 * @path /components/ui/input.tsx
 * @author Auto-generated
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-2",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
