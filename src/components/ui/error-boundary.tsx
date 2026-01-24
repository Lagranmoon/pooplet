/**
 * 错误边界组件
 *
 * 捕获子组件树中的 JavaScript 错误
 * 提供页面级、组件级和段落级三种错误处理模式
 * 开发环境下显示详细错误信息
 * 
 * @path /src/components/ui/error-boundary.tsx
 * @author Auto-generated
 */

"use client";

import React from "react";
import { Button } from "../../../components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: "page" | "component" | "section";
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    if (process.env.NODE_ENV === 'development') {
      console.group('🔴 Error Boundary Caught an Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      switch (this.props.level) {
        case "page":
          return this.renderPageError();
        case "component":
          return this.renderComponentError();
        case "section":
          return this.renderSectionError();
        default:
          return this.renderComponentError();
      }
    }

    return this.props.children;
  }

  private renderPageError() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-4">页面加载失败</h1>
          <p className="text-slate-600 mb-8">
            抱歉，页面遇到了一些问题。请尝试刷新页面或联系技术支持。
          </p>
          
          <div className="space-y-3">
            <Button onClick={this.handleRetry} className="w-full">
              重新加载
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              返回首页
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                开发模式错误详情 (点击展开)
              </summary>
              <div className="mt-4 p-4 bg-slate-100 rounded-lg text-xs text-slate-700 font-mono whitespace-pre-wrap">
                <div className="mb-2">
                  <strong>Error:</strong> {this.state.error.message}
                </div>
                <div className="mb-2">
                  <strong>Stack:</strong>
                </div>
                <div>{this.state.error.stack}</div>
                {this.state.errorInfo && (
                  <>
                    <div className="mt-4">
                      <strong>Component Stack:</strong>
                    </div>
                    <div>{this.state.errorInfo.componentStack}</div>
                  </>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  private renderComponentError() {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-red-900 mb-2">组件加载失败</h3>
        <p className="text-red-700 mb-4">此组件遇到了错误，请刷新页面重试。</p>
        
        <Button onClick={this.handleRetry} variant="outline" size="sm">
          重新加载
        </Button>
      </div>
    );
  }

  private renderSectionError() {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-900">内容暂时不可用</p>
            <p className="text-xs text-amber-700">请稍后重试</p>
          </div>
        </div>
      </div>
    );
  }
}