import { test, expect } from '@playwright/test';

test.describe('系统配置功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问登录页面
    await page.goto('http://localhost:3000/login');
  });

  test('管理员可以关闭和开启注册功能', async ({ page, context }) => {
    // 使用管理员账号登录
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 等待导航到首页
    await page.waitForURL('http://localhost:3000/');
    await expect(page.locator('text=今天')).toBeVisible();

    // 导航到管理页面
    await page.goto('http://localhost:3000/admin');
    await expect(page.locator('text=管理中心')).toBeVisible();

    // 切换到系统设置标签
    await page.click('text=系统设置');
    await expect(page.locator('text=开放注册')).toBeVisible();

    // 检查初始状态（应该是开启的）
    const toggle = page.locator('button').filter({ hasText: '' }).nth(0);
    await expect(page.locator('text=注册功能已开启')).toBeVisible();

    // 关闭注册功能
    await page.click('button[onClick*=handleToggleRegistration]');
    await expect(page.locator('text=注册功能已关闭')).toBeVisible();

    // 验证注册功能已关闭 - 尝试注册新用户
    const newPage = await context.newPage();
    await newPage.goto('http://localhost:3000/register');

    await newPage.fill('input[type="email"]', 'testuser@example.com');
    await newPage.fill('input[type="password"]', 'password123');
    await newPage.fill('input[name="name"]', 'Test User');
    await newPage.click('button[type="submit"]');

    // 应该显示错误消息
    await expect(newPage.locator('text=Registration is currently disabled')).toBeVisible();

    // 关闭测试页面
    await newPage.close();

    // 重新开启注册功能
    await page.click('button[onClick*=handleToggleRegistration]');
    await expect(page.locator('text=注册功能已开启')).toBeVisible();

    // 验证注册功能已开启 - 尝试注册新用户
    const anotherPage = await context.newPage();
    await anotherPage.goto('http://localhost:3000/register');

    await anotherPage.fill('input[type="email"]', `testuser${Date.now()}@example.com`);
    await anotherPage.fill('input[type="password"]', 'password123');
    await anotherPage.fill('input[name="name"]', 'Test User');
    await anotherPage.click('button[type="submit"]');

    // 应该成功注册并导航到首页
    await anotherPage.waitForURL('http://localhost:3000/');
    await expect(anotherPage.locator('text=今天')).toBeVisible();

    await anotherPage.close();
  });

  test('非管理员用户无法访问管理页面', async ({ page }) => {
    // 使用普通用户账号登录（如果存在）
    // 这里假设已经有普通用户账号，如果没有，需要先创建
    await page.fill('input[type="email"]', 'user@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 等待导航到首页
    await page.waitForURL('http://localhost:3000/');

    // 尝试访问管理页面
    await page.goto('http://localhost:3000/admin');

    // 应该显示权限不足消息
    await expect(page.locator('text=需要管理员权限')).toBeVisible();
  });
});
