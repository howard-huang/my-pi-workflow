---
name: typescript-testing
description: TypeScript 项目测试最佳实践。使用 Vitest + Testing Library。当用户需要写测试、审查测试或配置测试环境时使用。
---

# TypeScript 测试技能

## 工具链
- **测试框架**: Vitest（优先）或 Jest
- **React 测试**: @testing-library/react + @testing-library/user-event
- **Mock**: MSW (API), vi.fn() (函数)
- **覆盖率**: v8 (内置)

## 核心原则
1. **测试行为，非实现** - 用 `screen.getByRole`，不用 `getByTestId`
2. **一个测试一个概念** - 避免多个断言测试不同行为
3. **Arrange-Act-Assert** - 清晰的三段式结构
4. **避免测试第三方库** - 不测 React/Vitest 本身

## 文件命名
```
Component.test.tsx      # 组件测试
utils.test.ts           # 工具函数测试
hooks.test.ts           # Hook 测试
__tests__/              # 复杂模块的测试目录
```

## 常用模式

### 组件测试
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('submits with valid input', async () => {
    // Arrange
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    
    // Act
    await userEvent.type(
      screen.getByRole('textbox', { name: /email/i }), 
      'test@example.com'
    );
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Assert
    expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
  });
});
```

### API Mock (MSW)
```ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/user', () => {
    return HttpResponse.json({ id: 1, name: 'Test' });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 配置参考

### vitest.config.ts
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '__tests__/setup.ts'],
    },
  },
});
```

## 反模式
- ❌ 测试内部状态 (`component.state`)
- ❌ 浅渲染（不用 `shallow`）
- ❌ 过度 mock（特别是自己的模块）
- ❌ 测试实现细节（如具体函数调用顺序）
