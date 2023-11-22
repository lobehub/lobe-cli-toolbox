---
title: 服务端开发
group: 插件开发
order: 1
---

# Server-side Development of Plugins

The server-side only needs to implement the API interfaces described in the manifest. In the template, we use Vercel's[Edge Runtime](https://nextjs.org/docs/pages/api-reference/edge)as the service, eliminating the need for operation and maintenance costs.

## API Implementation

For the Edge Runtime, we provide the`@lobehub/chat-plugin-sdk`method in`createErrorResponse`for quickly returning error responses. Currently, the error types provided are detailed in[PluginErrorType.](/api/error)。

The implementation of the clothes interface in the template is as follows:

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

The`maniClothes`and`womanClothes`are hardcoded mock data. In actual scenarios, they can be replaced with database requests.

## gateway

Since the default plugin gateway for LobeChat is a cloud service (<https://chat.lobehub.com/api/plugins>), the cloud service sends requests using the API address defined in the manifest to solve cross-domain issues.

However, for custom plugins, the plugin requests need to be sent to the local service. Therefore, by specifying the gateway (<http://localhost:3400/api/gateway>) in the manifest, LobeChat will directly request this address, and then you only need to create a gateway implementation at this address.

```ts
import { createLobeChatPluginGateway } from '@lobehub/chat-plugins-gateway';

export const config = {
  runtime: 'edge',
};

export default async createLobeChatPluginGateway();
```

[`@lobehub/chat-plugins-gateway`](https://github.com/lobehub/chat-plugins-gateway) contains the implementation of the plugin gateway in LobeChat, which allows you to directly use this package to create a gateway and enable LobeChat to access the local plugin service.[实现](https://github.com/lobehub/lobe-chat/blob/main/src/pages/api/plugins.api.ts)，你可以直接使用该包创建网关，进而让 LobeChat 访问到本地的插件服务。

## Other Server-side Implementation Examples

As the server-side of the plugin supports implementation in any framework and any programming language, here are some implementation examples for reference:

- Vercel Node.js Runtime server-side implementation:[chat-plugin-web-crawler](https://github.com/lobehub/chat-plugin-web-crawler/blob/main/api/v1/index.ts)
- Contributions are welcome.

## Support for OpenAPI Manifest

In addition to using the 'api' field to define the server-side of the plugin, we also plan to support the use of the OpenAPI specification to describe the functions of the plugin. This will make it more convenient to use existing OpenAPI tools to build plugin services. This capability will be addressed in[lobehub/chat-plugin-sdk#13.](https://github.com/lobehub/chat-plugin-sdk/issues/13)
