---
title: useOnStandalonePluginInit
description: 监听插件初始化事件
nav: API
order: 10
apiHeader:
  pkg: '@lobehub/chat-plugin-sdk/client'
group: Hooks
---

用于监听 standalone 类型的插件初始化。

## 语法

```ts
useOnStandalonePluginInit<T>(callback: (payload: PluginPayload<T>) => void): void;
```

## 参数

| 参数       | 类型                                  | 描述                                                                                                        |
| ---------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `callback` | `(payload: PluginPayload<T>) => void` | 回调函数，当插件初始化事件触发时，将会调用该回调函数，并将插件初始化事件的 payload 作为参数传递给回调函数。 |

## 示例

```tsx | pure
import { useOnStandalonePluginInit } from '@lobehub/chat-plugin-sdk/client';

const Demo = () => {
  useOnStandalonePluginInit((payload) => {
    console.log('插件初始化事件触发');
    console.log('payload:', payload);
  });

  return <div>监听插件初始化事件</div>;
};

export default Demo;
```

## 注意事项

- 请确保 `useOnStandalonePluginInit` 在 React 函数组件内部使用。
- `useOnStandalonePluginInit` 只会在组件挂载时执行一次。
- 在回调函数中可以处理插件初始化事件的 payload，例如获取初始化参数、调用初始化函数等。

## 回调函数参数类型定义

```ts
interface PluginPayload<T = any> {
  args?: T;
  func: string;
}
```

| 属性        | 类型     | 描述                     |
| ----------- | -------- | ------------------------ |
| `arguments` | `T`      | 插件初始化事件的参数     |
| `name`      | `string` | 插件初始化事件的函数名称 |
