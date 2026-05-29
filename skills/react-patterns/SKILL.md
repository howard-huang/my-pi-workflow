---
name: react-patterns
description: React 组件开发与模式最佳实践。包含组件设计、状态管理、性能优化、Hooks 使用规范。当用户编写 React 组件、设计架构或审查 React 代码时使用。
---

# React 模式技能

## 工具链
- **框架**: React 18+ (优先使用 Concurrent Features)
- **类型**: TypeScript (严格模式)
- **样式**: CSS Modules / Tailwind / Styled Components
- **状态**: Zustand / Jotai (轻量) 或 Redux Toolkit (复杂)
- **路由**: React Router v6 / TanStack Router

## 核心原则
1. **组件单一职责** - 一个组件只做一件事
2. **Props 向下传，事件向上抛** - 单向数据流
3. **优先组合而非继承** - 使用 children 和 render props
4. **最小化状态** - 能用派生就不用状态
5. **懒加载默认化** - 大组件默认 `React.lazy`

## 组件设计模式

### 容器/展示分离（现代简化版）
```tsx
// 容器：处理数据和副作用
export function UserProfileContainer({ userId }: { userId: string }) {
  const { data, isLoading } = useUser(userId);
  if (isLoading) return <Skeleton />;
  if (!data) return <NotFound />;
  return <UserProfile user={data} />;
}

// 展示：纯渲染
export function UserProfile({ user }: { user: User }) {
  return (
    <article>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </article>
  );
}
```

### 复合组件 (Compound Component)
```tsx
// Tabs.tsx
import { createContext, useContext, useState } from 'react';

const TabsContext = createContext<{ active: string; setActive: (v: string) => void } | null>(null);

export function Tabs({ children, defaultValue }: { children: React.ReactNode; defaultValue: string }) {
  const [active, setActive] = useState(defaultValue);
  return <TabsContext.Provider value={{ active, setActive }}>{children}</TabsContext.Provider>;
}

export function TabList({ children }: { children: React.ReactNode }) {
  return <div role="tablist">{children}</div>;
}

export function Tab({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tab must be inside Tabs');
  return (
    <button role="tab" aria-selected={ctx.active === value} onClick={() => ctx.setActive(value)}>
      {children}
    </button>
  );
}
```

## Hooks 规范

### 自定义 Hook 模板
```ts
import { useState, useEffect, useCallback } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
```

### Hooks 规则
- 只在最顶层调用 Hooks
- 只在 React 函数中调用 Hooks
- 依赖数组必须完整（使用 `eslint-plugin-react-hooks`）
- `useEffect` 应该只做一件事，多个无关逻辑拆分成多个 effect

## 性能优化

### Memo 使用策略
```tsx
// 1. 子组件接收复杂对象或函数时包裹 memo
const ExpensiveList = React.memo(function ExpensiveList({ items }: { items: Item[] }) {
  return <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
});

// 2. 使用 useMemo 缓存计算结果
const sorted = useMemo(() => items.sort((a, b) => a.score - b.score), [items]);

// 3. 使用 useCallback 缓存事件处理器
const handleClick = useCallback((id: string) => {
  navigate(`/item/${id}`);
}, [navigate]);
```

**不要过早优化**：先测量，再优化。React 默认已经很快。

## 状态管理决策树

| 场景 | 方案 |
|------|------|
| 局部 UI 状态（模态框、表单） | `useState` / `useReducer` |
| 跨组件共享（同分支） | Context + `useReducer` |
| 跨组件共享（跨分支/全局） | Zustand / Jotai |
| 服务端状态 | TanStack Query / SWR |
| 复杂表单 | React Hook Form |

## 反模式
- ❌ 在 `useEffect` 中直接调用 setState 造成无限循环
- ❌ 把派生数据存入 state
- ❌ 用 `useMemo` 包裹没有副作用的简单计算
- ❌ 在 render 中创建新函数/对象（破坏 memo）
- ❌ 滥用 Context 导致不必要的重渲染
