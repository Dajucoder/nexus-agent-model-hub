import { NextRequest } from 'next/server';
import { modelCatalog } from '../../../lib/model-data';
import { getProviderConfig } from '../../../lib/server/provider-config-store';

function findModel(id: string) {
  return modelCatalog.find((model) => model.id === id || model.slug === id);
}

async function streamText(text: string) {
  const encoder = new TextEncoder();

  return new ReadableStream({
    start(controller) {
      const pieces = text.split('');
      let index = 0;
      const timer = setInterval(() => {
        if (index >= pieces.length) {
          clearInterval(timer);
          controller.close();
          return;
        }

        controller.enqueue(encoder.encode(pieces[index]));
        index += 1;
      }, 8);

      return () => clearInterval(timer);
    },
    cancel() {
      return;
    }
  });
}

async function requestOpenAICompatible(baseUrl: string, apiKey: string, modelName: string, prompt: string) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Upstream request failed');
  }

  const payload = await response.json();
  return String(payload.choices?.[0]?.message?.content ?? '');
}

async function requestAnthropic(baseUrl: string, apiKey: string, modelName: string, prompt: string) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: modelName,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Upstream request failed');
  }

  const payload = await response.json();
  const textBlock = payload.content?.find?.((item: { type?: string }) => item.type === 'text');
  return String(textBlock?.text ?? '');
}

async function requestGoogle(baseUrl: string, apiKey: string, modelName: string, prompt: string) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Upstream request failed');
  }

  const payload = await response.json();
  return String(payload.candidates?.[0]?.content?.parts?.[0]?.text ?? '');
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const model = findModel(String(body.modelId ?? ''));
  const prompt = String(body.prompt ?? '');

  if (!model || prompt.trim().length === 0) {
    return new Response('invalid request', { status: 400 });
  }

  const providerConfig = await getProviderConfig(model.provider.id);
  let text = '';

  try {
    if (providerConfig?.apiKey) {
      if (model.provider.chatApiStyle === 'openai-compatible') {
        text = await requestOpenAICompatible(providerConfig.baseUrl, providerConfig.apiKey, model.id, prompt);
      } else if (model.provider.chatApiStyle === 'anthropic') {
        text = await requestAnthropic(providerConfig.baseUrl, providerConfig.apiKey, model.id, prompt);
      } else if (model.provider.chatApiStyle === 'google') {
        text = await requestGoogle(providerConfig.baseUrl, providerConfig.apiKey, model.id, prompt);
      }
    }
  } catch (error) {
    text = `真实供应商请求失败，已回退到本地说明。\n错误信息：${error instanceof Error ? error.message : 'unknown error'}`;
  }

  if (!text.trim()) {
    text = [
      `你当前正在使用 ${model.name} 的本地回退模式。`,
      providerConfig?.apiKey
        ? `已检测到 ${model.provider.name} 配置，但当前模型仍未返回有效内容，因此回退到本地说明。`
        : `当前还没有为 ${model.provider.name} 配置 API Key，所以暂时无法发起真实请求。`,
      `你输入的内容是：${prompt}`,
      `先到 /settings 保存对应供应商的 API Key 和 Base URL，再返回这里继续测试。`
    ].join('\n');
  }

  const stream = await streamText(text);

  return new Response(stream, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-cache'
    }
  });
}
