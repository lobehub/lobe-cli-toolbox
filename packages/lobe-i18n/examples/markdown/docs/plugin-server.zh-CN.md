---
title: 服务端开发
group: 插件开发
order: 1
---

# 插件的服务端开发

服务端只需要实现 manifest 中描述的 api 接口即可。在模板中，我们使用了 vercel 的 [Edge Runtime](https://nextjs.org/docs/pages/api-reference/edge) 作为服务，免去运维成本。

## api 实现

针对 Edge Runtime ，我们在 `@lobehub/chat-plugin-sdk` 提供了 `createErrorResponse` 方法，用于快速返回错误响应。目前提供的错误类型详见：[PluginErrorType](/api/error)。

模板中的 clothes 接口实现如下：

```ts
export default async (req: Request) => {
  if (req.method !== 'POST') return createErrorResponse(PluginErrorType.MethodNotAllowed);

  const { gender, mood } = (await req.json()) as RequestData;

  const clothes = gender === 'man' ? manClothes : womanClothes;

  const result: ResponseData = {
    clothes: clothes[mood] || [],
    mood,
    today: Date.now(),
  };

  return new Response(JSON.stringify(result));
};
```

其中 `maniClothes` 和 `womanClothes` 是写死的 mock 数据，在实际场景中，可以替换为数据库请求。

## gateway

由于 LobeChat 默认的插件网关是云端服务（<https://chat.lobehub.com/api/plugins>），云端服务通过 manifest 上的 api 地址发送请求，以解决跨域问题。

而针对自定义插件，插件的请求需要发送给本地服务的， 因此通过在 manifest 中指定网关 (<http://localhost:3400/api/gateway>)，LobeChat 将会直接请求该地址，然后只需要在该地址下创建一个网关实现即可。

```ts
import { createLobeChatPluginGateway } from '@lobehub/chat-plugins-gateway';

export const config = {
  runtime: 'edge',
};

export default async createLobeChatPluginGateway();
```

[`@lobehub/chat-plugins-gateway`](https://github.com/lobehub/chat-plugins-gateway) 包含了 LobeChat 中插件网关的[实现](https://github.com/lobehub/lobe-chat/blob/main/src/pages/api/plugins.api.ts)，你可以直接使用该包创建网关，进而让 LobeChat 访问到本地的插件服务。

## 其他服务端实现示例

由于插件的服务端侧支持任意框架、任意语言的实现，在这里提供一些实现示例以供参考：

- Vercel Node.Js 运行时服务端实现：[chat-plugin-web-crawler](https://github.com/lobehub/chat-plugin-web-crawler/blob/main/api/v1/index.ts)
- 欢迎贡献

## 支持 OpenAPI Manifest

除了使用 api 字段定义插件的服务端以外，我们还计划支持 OpenAPI 规范来描述插件的功能，这样可以更方便的使用已有的 OpenAPI 工具来形成插件服务。该能力将在[lobehub/chat-plugin-sdk#13](https://github.com/lobehub/chat-plugin-sdk/issues/13) 中跟进。
