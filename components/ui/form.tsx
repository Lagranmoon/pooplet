/**
 * 表单组件
 *
 * 表单容器组件，提供统一的间距和布局
 * 可与 Label、Input 等组件配合使用
 * 
 * @path /components/ui/form.tsx
 * @author Auto-generated
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export type FormProps = React.FormHTMLAttributes<HTMLFormElement>;

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, ...props }, ref) => (
    <form
      ref={ref}
      className={cn("space-y-4", className)}
      {...props}
    />
  )
);
Form.displayName = "Form";
